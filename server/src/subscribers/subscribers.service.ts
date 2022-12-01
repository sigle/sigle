import { BadRequestException, Injectable } from '@nestjs/common';
import { validate } from 'deep-email-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriberDto } from './dto/createSubscriber.dto';
import {
  BulkContactManagement,
  Contact,
  ContactList,
  ContactSubscription,
} from 'node-mailjet';
import { ConfigService } from '@nestjs/config';
// Mailjet API https://dev.mailjet.com/email/reference/overview/authentication/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

// Production list
const allowedNewsletterUsers = [
  // sigle.btc
  'SP2EVYKET55QH40RAZE5PVZ363QX0X6BSRP4C7H0W',
];
if (process.env.NODE_ENV === 'development') {
  // leopradel.btc
  allowedNewsletterUsers.push('SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q');
}

@Injectable()
export class SubscribersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async create({ stacksAddress, email }: CreateSubscriberDto) {
    // TODO - remove this check once newsletter feature is ready
    // Limit who can access this feature
    if (!allowedNewsletterUsers.includes(stacksAddress)) {
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

    let contactId: number | undefined;
    try {
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
      const data: { body: ContactList.TGetContactListResponse } = await mailjet
        .get('contactslist?Name=sigle', { version: 'v3' })
        .request();
      const listId = data.body.Data[0].ID;
      const contactList: ContactSubscription.IPostContactManageContactsListsBody =
        {
          ContactsLists: [
            {
              ListID: listId,
              Action:
                'addnoforce' as BulkContactManagement.ManageContactsAction.AddNoForce,
            },
          ],
        };
      await mailjet
        .post('contact')
        .id(contactId)
        .action('managecontactslists')
        .request(contactList);
    }

    return {
      createdAt: new Date(),
      email,
    };
  }
}
