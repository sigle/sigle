import { BadGatewayException, Injectable } from '@nestjs/common';
import { validate } from 'deep-email-validator';
import { PrismaService } from '../prisma.service';
import { CreateSubscriberDto } from './dto/createSubscriber.dto';

@Injectable()
export class SubscribersService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ stacksAddress, email }: CreateSubscriberDto) {
    // Check that the user exists in the DB
    const user = this.prisma.user.findUniqueOrThrow({
      select: { id: true },
      where: { stacksAddress },
    });

    // Quick verify email
    const res = await validate({
      email,
      // This is already checked by the router
      validateRegex: false,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      // Ideally we want to set this one to true.
      // But because of many false positives we disabled it.
      validateSMTP: false,
    });
    if (!res.valid) {
      throw new BadGatewayException('Invalid email.');
    }

    // TODO verify that user has email settings setup
    // TODO create subscriber via Mail API in right list
  }
}
