import { BadRequestException, Injectable } from '@nestjs/common';
import * as mjml2html from 'mjml';
import { allowedNewsletterUsers } from '../utils';
import { PrismaService } from '../prisma/prisma.service';
import { StacksService } from '../stacks/stacks.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class StoriesService {
  constructor(
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
      const MJMLNewsletter = this.emailService.storyToMJML({
        username,
        story: publicStory,
        settings: publicSettings,
      });
      const htmlNewsletter = mjml2html(MJMLNewsletter).html;
      // TODO check if newsletter has errors and report it  mjml2html(MJMLNewsletter).errors

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
