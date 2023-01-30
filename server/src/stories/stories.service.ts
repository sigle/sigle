import { BadRequestException, Injectable } from '@nestjs/common';
import { SendEmailV3_1 } from 'node-mailjet';
import * as textVersion from 'textversionjs';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { allowedNewsletterUsers } from '../utils';
import { PrismaService } from '../prisma/prisma.service';
import { StacksService } from '../stacks/stacks.service';
import { BulkEmailService } from '../bulk-email/bulk-email.service';
import { PosthogService } from '../posthog/posthog.service';
import { isEmail } from 'class-validator';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

@Injectable()
export class StoriesService {
  constructor(
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly prisma: PrismaService,
    private readonly posthog: PosthogService,
    private readonly stacksService: StacksService,
    private readonly bulkEmailService: BulkEmailService,
  ) {}

  async get({
    stacksAddress,
    gaiaId,
  }: {
    stacksAddress: string;
    gaiaId: string;
  }) {
    return this.prisma.story.findFirst({
      select: {
        id: true,
        publishedAt: true,
        unpublishedAt: true,
        deletedAt: true,
        email: {
          select: {
            id: true,
          },
        },
      },
      where: {
        user: { stacksAddress: stacksAddress },
        gaiaId: gaiaId,
      },
    });
  }

  async publish({
    stacksAddress,
    gaiaId,
    send,
  }: {
    stacksAddress: string;
    gaiaId: string;
    send: boolean;
  }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        newsletter: {
          select: {
            id: true,
            status: true,
            mailjetApiKey: true,
            mailjetApiSecret: true,
            mailjetListAddress: true,
            senderEmail: true,
          },
        },
      },
      where: { stacksAddress },
    });

    let story = await this.prisma.story.findFirst({
      select: {
        id: true,
        email: {
          select: {
            id: true,
          },
        },
      },
      where: {
        user: { stacksAddress: stacksAddress },
        gaiaId: gaiaId,
      },
    });

    story = await this.prisma.story.upsert({
      select: {
        id: true,
        email: {
          select: {
            id: true,
          },
        },
      },
      // Workaround for select to work when creating the story
      where: { id: story ? story.id : 'none' },
      create: {
        userId: user.id,
        gaiaId,
        publishedAt: new Date(),
      },
      update: {
        publishedAt: new Date(),
      },
    });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'story published',
      properties: {
        storyId: story.id,
        gaiaId: gaiaId,
      },
    });

    if (send) {
      // Limit who can access this feature
      if (!allowedNewsletterUsers.includes(stacksAddress)) {
        throw new BadRequestException('Not activated.');
      }
      if (!user.newsletter || user.newsletter.status !== 'ACTIVE') {
        throw new BadRequestException('Newsletter not setup.');
      }
      if (story.email) {
        // Newsletter already exists, do not send it again
        throw new BadRequestException('Newsletter already sent');
      }

      const username = await this.stacksService.getUsernameByAddress(
        stacksAddress,
      );
      const bucketUrl = await this.stacksService.getBucketUrl({ username });
      const [publicSettings, publicStory] = await Promise.all([
        this.stacksService.getPublicSettings({
          bucketUrl: bucketUrl.bucketUrl,
        }),
        this.stacksService.getPublicStory({
          bucketUrl: bucketUrl.bucketUrl,
          storyId: gaiaId,
        }),
      ]);
      const newsletterHtml = this.bulkEmailService.storyToHTML({
        stacksAddress,
        username,
        story: publicStory,
        settings: publicSettings,
      });

      const mailjet = new Mailjet({
        apiKey: user.newsletter.mailjetApiKey,
        apiSecret: user.newsletter.mailjetApiSecret,
      });

      const listEmail = `${user.newsletter.mailjetListAddress}@lists.mailjet.com`;

      const sendEmailBody: SendEmailV3_1.IBody = {
        SandboxMode: false,
        AdvanceErrorHandling: true,
        Messages: [
          {
            From: {
              Email: user.newsletter.senderEmail,
              Name: publicSettings.siteName || username,
            },
            To: [
              {
                Email: listEmail,
              },
            ],
            Subject: publicStory.title,
            HTMLPart: newsletterHtml,
            TextPart: textVersion(newsletterHtml),
          },
        ],
      };

      try {
        await mailjet.post('send', { version: 'v3.1' }).request(sendEmailBody);
      } catch (error) {
        // Format mailjet errors as package is messing with the error object
        // so it can be sent to sentry properly
        const mailjetError = {
          ErrorIdentifier: error.response.data.ErrorIdentifier,
          ErrorCode: error.response.data.ErrorCode,
          StatusCode: error.response.data.StatusCode,
          ErrorMessage: error.response.data.ErrorMessage,
          Messages: error.response.data.Messages?.map(
            (message: SendEmailV3_1.IResponseMessage) => ({
              Status: message.Status,
              Errors: message.Errors.map(
                (error: SendEmailV3_1.IResponseError) => ({
                  ErrorIdentifier: error.ErrorIdentifier,
                  ErrorCode: error.ErrorCode,
                  StatusCode: error.StatusCode,
                  ErrorMessage: error.ErrorMessage,
                  ErrorRelatedTo: error.ErrorRelatedTo,
                }),
              ),
            }),
          ),
        };
        this.sentryService.instance().captureException(error, {
          level: 'error',
          extra: {
            stacksAddress,
            storyId: story.id,
            mailjetError,
          },
        });
        if (mailjetError.ErrorCode === 'mj-0001') {
          throw new BadRequestException(
            'Failed to send newsletter. Your account Mailjet account is blocked. Please contact the Mailjet support team to get assistance.',
          );
        }
        throw new BadRequestException('Failed to send newsletter');
      }

      await this.prisma.email.create({
        select: { id: true },
        data: {
          newsletterId: user.newsletter.id,
          storyId: story.id,
        },
      });

      this.posthog.capture({
        distinctId: stacksAddress,
        event: 'newsletter sent',
        properties: {
          storyId: story.id,
          gaiaId: gaiaId,
        },
      });
    }
  }

  async unpublish({
    stacksAddress,
    gaiaId,
  }: {
    stacksAddress: string;
    gaiaId: string;
  }) {
    const story = await this.prisma.story.findFirst({
      select: { id: true },
      where: {
        user: { stacksAddress: stacksAddress },
        gaiaId: gaiaId,
      },
    });

    if (story) {
      await this.prisma.story.update({
        where: { id: story.id },
        data: { unpublishedAt: new Date() },
      });

      this.posthog.capture({
        distinctId: stacksAddress,
        event: 'story unpublished',
        properties: {
          storyId: story.id,
          gaiaId: gaiaId,
        },
      });
    }
  }

  async delete({
    stacksAddress,
    gaiaId,
  }: {
    stacksAddress: string;
    gaiaId: string;
  }) {
    const story = await this.prisma.story.findFirst({
      select: { id: true },
      where: {
        user: { stacksAddress: stacksAddress },
        gaiaId: gaiaId,
      },
    });

    if (story) {
      await this.prisma.story.update({
        where: { id: story.id },
        data: { deletedAt: new Date() },
      });

      this.posthog.capture({
        distinctId: stacksAddress,
        event: 'story deleted',
        properties: {
          storyId: story.id,
          gaiaId: gaiaId,
        },
      });
    }
  }

  async sendTestStory({
    stacksAddress,
    gaiaId,
    emails,
  }: {
    stacksAddress: string;
    gaiaId: string;
    emails: string;
  }) {
    // Validate emails are valid
    const emailList = emails.split(',');
    const invalidEmails = emailList.filter((email) => !isEmail(email));
    if (invalidEmails.length > 0) {
      throw new BadRequestException(
        `Invalid emails: ${invalidEmails.join(', ')}`,
      );
    }

    const validEmails = emailList.filter((email) => isEmail(email));

    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        newsletter: {
          select: {
            id: true,
            status: true,
            mailjetApiKey: true,
            mailjetApiSecret: true,
            mailjetListAddress: true,
            senderEmail: true,
          },
        },
      },
      where: { stacksAddress },
    });

    // Limit who can access this feature
    if (!allowedNewsletterUsers.includes(stacksAddress)) {
      throw new BadRequestException('Not activated.');
    }
    if (!user.newsletter || user.newsletter.status !== 'ACTIVE') {
      throw new BadRequestException('Newsletter not setup.');
    }

    const username = await this.stacksService.getUsernameByAddress(
      stacksAddress,
    );
    const bucketUrl = await this.stacksService.getBucketUrl({ username });
    const publicSettings = await this.stacksService.getPublicSettings({
      bucketUrl: bucketUrl.bucketUrl,
    });

    // const newsletterHtml = this.bulkEmailService.storyToHTML({
    //   stacksAddress,
    //   username,
    //   story: publicStory,
    //   settings: publicSettings,
    // });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'newsletter test sent',
      properties: {
        gaiaId: gaiaId,
        recipientsNumber: validEmails.length,
      },
    });
  }
}
