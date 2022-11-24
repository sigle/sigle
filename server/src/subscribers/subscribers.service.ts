import { BadRequestException, Injectable } from '@nestjs/common';
import { validate } from 'deep-email-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriberDto } from './dto/createSubscriber.dto';
import { Contact } from 'node-mailjet';
const Mailjet = require('node-mailjet');

@Injectable()
export class SubscribersService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ stacksAddress, email }: CreateSubscriberDto) {
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

    const mailJetApiKey = '';
    const mailJetSecretKey = '';

    const mailjet = new Mailjet({
      apiKey: mailJetApiKey,
      apiSecret: mailJetSecretKey,
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
