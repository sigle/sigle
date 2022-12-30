import { BadRequestException, Injectable } from '@nestjs/common';
import { allowedNewsletterUsers } from '../utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

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
