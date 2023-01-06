import { BadRequestException, Injectable } from '@nestjs/common';
import { SendEmailV3_1 } from 'node-mailjet';
import * as textVersion from 'textversionjs';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { allowedNewsletterUsers } from '../utils';
import { PrismaService } from '../prisma/prisma.service';
import { StacksService } from '../stacks/stacks.service';
import { EmailService } from '../email/email.service';
import { PosthogService } from '../posthog/posthog.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

@Injectable()
export class StoriesService {
  constructor(
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly prisma: PrismaService,
    private readonly posthog: PosthogService,
    private readonly stacksService: StacksService,
    private readonly emailService: EmailService,
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
        sentAt: true,
        unpublishedAt: true,
        deletedAt: true,
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
            mailjetApikey: true,
            mailjetApiSecret: true,
            mailjetListAddress: true,
          },
        },
      },
      where: { stacksAddress },
    });
    if (!user.newsletter) {
      throw new BadRequestException('Newsletter not setup.');
    }

    let story = await this.prisma.story.findFirst({
      select: {
        id: true,
        sentAt: true,
      },
      where: {
        user: { stacksAddress: stacksAddress },
        gaiaId: gaiaId,
      },
    });

    story = await this.prisma.story.upsert({
      select: {
        id: true,
        sentAt: true,
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
      if (story.sentAt) {
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
      const newsletterHtml = this.emailService.storyToHTML({
        stacksAddress,
        username,
        story: publicStory,
        settings: publicSettings,
      });

      const mailjet = new Mailjet({
        apiKey: user.newsletter.mailjetApikey,
        apiSecret: user.newsletter.mailjetApiSecret,
      });

      const listEmail = `${user.newsletter.mailjetListAddress}@lists.mailjet.com`;

      const sendEmailBody: SendEmailV3_1.IBody = {
        SandboxMode: false,
        AdvanceErrorHandling: true,
        Messages: [
          {
            From: {
              // TODO take it from user preference
              Email: 'leo@sigle.io',
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
        const formattedErrors = error.response.data.Messages.map(
          (message: any) => {
            return {
              Status: message.Status,
              Errors: message.Errors.map(
                (error: SendEmailV3_1.IResponseError) => {
                  return {
                    ErrorIdentifier: error.ErrorIdentifier,
                    ErrorCode: error.ErrorCode,
                    StatusCode: error.StatusCode,
                    ErrorMessage: error.ErrorMessage,
                    ErrorRelatedTo: error.ErrorRelatedTo,
                  };
                },
              ),
            };
          },
        );
        this.sentryService.instance().captureException(error, {
          level: 'error',
          extra: {
            stacksAddress,
            storyId: story.id,
            mailjetErrors: formattedErrors,
          },
        });
        throw new BadRequestException('Failed to send newsletter');
      }

      await this.prisma.story.update({
        select: { id: true },
        where: { id: story.id },
        data: {
          sentAt: new Date(),
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
}
