import { BadRequestException, Injectable } from '@nestjs/common';
import { validate } from 'deep-email-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriberDto } from './dto/createSubscriber.dto';
import { Contact } from 'node-mailjet';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

@Injectable()
export class SubscribersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async create({ stacksAddress, email }: CreateSubscriberDto) {
    // TODO - remove this check once newsletter feature is ready
    // Limit who can access this feature
    if (
      this.configService.get('NODE_ENV') === 'production' &&
      stacksAddress !== 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q'
    ) {
      throw new BadRequestException('Not activated.');
    }

    // Check that the user exists in the DB
    const user = await this.prisma.user.findUnique({
      select: { id: true },
      where: { stacksAddress },
    });
    if (!user) {
      throw new BadRequestException('Invalid user.');
    }

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
      throw new BadRequestException('Invalid email.');
    }

    // TODO verify that user has email settings setup

    const mailjet = new Mailjet({
      apiKey: this.configService.get('MAILJET_API_KEY'),
      apiSecret: this.configService.get('MAILJET_API_SECRET'),
    });

    const newContact: Contact.IPostContactBody = {
      Email: email,
    };

    try {
      await mailjet.post('contact', { version: 'v3' }).request(newContact);
    } catch (error) {
      if (error.statusCode === 400 && error.statusText?.startsWith('MJ18')) {
        // Email already subscribed, ignore the error
      } else {
        throw error;
      }
    }
    // TODO create subscriber via Mail API in right list

    return {
      createdAt: new Date(),
      email,
    };
  }
}
