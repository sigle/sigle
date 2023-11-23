import { BadRequestException, Injectable } from '@nestjs/common';
import { validate } from 'deep-email-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriberDto } from './dto/createSubscriber.dto';
import {
  BulkContactManagement,
  Contact,
  ContactSubscription,
} from 'node-mailjet';
import { PosthogService } from '../posthog/posthog.service';
// Mailjet API https://dev.mailjet.com/email/reference/overview/authentication/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

@Injectable()
export class SubscribersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posthog: PosthogService,
  ) {}

  async create({ stacksAddress, email }: CreateSubscriberDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        newsletter: {
          select: {
            id: true,
            mailjetApiKey: true,
            mailjetApiSecret: true,
            mailjetListId: true,
          },
        },
      },
      where: { stacksAddress },
    });
    if (!user.newsletter) {
      throw new BadRequestException('Newsletter not setup.');
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

    const mailjet = new Mailjet({
      apiKey: user.newsletter.mailjetApiKey,
      apiSecret: user.newsletter.mailjetApiSecret,
    });

    let contactId: number | undefined;
    try {
      const newContact: Contact.IPostContactBody = {
        Email: email,
      };
      const response: { body: Contact.TPostContactResponse } = await mailjet
        .post('contact', { version: 'v3' })
        .request(newContact);
      contactId = response.body.Data[0].ID;
    } catch (error) {
      if (error.statusCode === 400 && error.statusText?.startsWith('MJ18')) {
        // Email already subscribed, ignore the error
      } else {
        throw error;
      }
    }

    // Add the new contact to the "sigle" list.
    // If already subscribed we skip this part.
    if (contactId) {
      const contactList: ContactSubscription.IPostContactManageContactsListsBody =
        {
          ContactsLists: [
            {
              ListID: user.newsletter.mailjetListId,
              Action:
                'addforce' as BulkContactManagement.ManageContactsAction.AddNoForce,
            },
          ],
        };
      await mailjet
        .post('contact')
        .id(contactId)
        .action('managecontactslists')
        .request(contactList);
    }

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'subscriber created',
      properties: {
        subscribedTo: stacksAddress,
      },
    });

    return {
      createdAt: new Date(),
      email,
    };
  }
}
