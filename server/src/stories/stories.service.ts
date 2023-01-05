import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailV3_1 } from 'node-mailjet';
import * as textVersion from 'textversionjs';
import { allowedNewsletterUsers } from '../utils';
import { PrismaService } from '../prisma/prisma.service';
import { StacksService } from '../stacks/stacks.service';
import { EmailService } from '../email/email.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

@Injectable()
export class StoriesService {
  constructor(
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

      const sendEmailBody: SendEmailV3_1.IBody = {
        SandboxMode: false,
        Messages: [
          {
            From: {
              // TODO take it from user preference
              Email: 'leo@sigle.io',
              Name: publicSettings.siteName || username,
            },
            To: [
              {
                // TODO how to get the list email?
                // TODO maybe can use the list ID?
                Email: 'TODO',
              },
            ],
            Subject: publicStory.title,
            HTMLPart: newsletterHtml,
            TextPart: textVersion(newsletterHtml),
          },
        ],
      };

      try {
        const data: { body: SendEmailV3_1.IResponse } = await mailjet
          .post('send', { version: 'v3.1' })
          .request(sendEmailBody);
        console.log(data);
      } catch (error) {
        // TODO report to sentry with all the info needed
        console.log(error);
        throw error;
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
