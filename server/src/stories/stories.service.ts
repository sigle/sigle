import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactList, SendEmailV3_1 } from 'node-mailjet';
import * as textVersion from 'textversionjs';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { allowedNewsletterUsers } from '../utils';
import { PrismaService } from '../prisma/prisma.service';
import { StacksService } from '../stacks/stacks.service';
import { EmailService } from '../email/email.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

@Injectable()
export class StoriesService {
  constructor(
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
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
    const user = await this.prisma.user.findUniqueOrThrow({
      select: { id: true },
      where: { stacksAddress },
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
        apiKey: this.configService.get('MAILJET_API_KEY'),
        apiSecret: this.configService.get('MAILJET_API_SECRET'),
      });

      const data: { body: ContactList.TGetContactListResponse } = await mailjet
        .get('contactslist?Name=sigle', { version: 'v3' })
        .request();
      const listAddress = data.body.Data[0].Address;
      const listEmail = `${listAddress}@lists.mailjet.com`;

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
    }
  }
}
