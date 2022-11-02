import { Injectable } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma.service';

export enum DismissableFlags {
  onboarding = 'onboarding',
}

@ApiTags('user')
@Injectable()
export class DismissableFlagsService {
  constructor(private prisma: PrismaService) {}

  async getUserDismissableFlags({ stacksAddress }: { stacksAddress: string }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { stacksAddress },
      select: { id: true },
    });
    let userDismissableFlags = await this.prisma.dismissableFlags.findUnique({
      where: { userId: user.id },
      select: { id: true, onboarding: true },
    });
    if (!userDismissableFlags) {
      userDismissableFlags = await this.prisma.dismissableFlags.create({
        data: { userId: user.id },
        select: { id: true, onboarding: true },
      });
    }
    return userDismissableFlags;
  }

  async updateUserDismissableFlags({
    stacksAddress,
    dismissableFlag,
  }: {
    stacksAddress: string;
    dismissableFlag: string;
  }) {
    const date = new Date();
    const onboarding = dismissableFlag === 'onboarding' && dismissableFlag;
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { stacksAddress },
      select: { id: true },
    });

    const updateDismissableFlags = await this.prisma.dismissableFlags.update({
      where: { userId: user.id },
      data: {
        [onboarding]: date,
      },
      select: { id: true, onboarding: true },
    });
    return updateDismissableFlags;
  }
}
