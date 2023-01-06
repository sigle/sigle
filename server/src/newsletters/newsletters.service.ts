import { BadRequestException, Injectable } from '@nestjs/common';
import { ContactList } from 'node-mailjet';
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

@Injectable()
export class NewslettersService {
  constructor(private readonly prisma: PrismaService) {}

  async update({
    stacksAddress,
    enabled,
    apiKey,
    apiSecret,
  }: {
    stacksAddress: string;
    enabled: string;
    apiKey: string;
    apiSecret: string;
  }): Promise<void> {
    // TODO guard with active subscription
    // TODO maybe create generic guard?
    // TODO validate keys if changed only
    // TODO create list with new keys
    // TODO upsert newsletter with new config

    await this.validateAndSetupMailjetConfig({
      apiKey,
      apiSecret,
    });
  }

  /**
   * Check that the credentials are correct.
   * Setup the required Mailjet contact list if it doesn't exist.
   */
  private async validateAndSetupMailjetConfig({
    apiKey,
    apiSecret,
  }: {
    apiKey: string;
    apiSecret: string;
  }): Promise<{ listId: number; listAddress: string }> {
    const mailjet = new Mailjet({
      apiKey,
      apiSecret,
    });
    let mailjetList: ContactList.IContactList;
    try {
      const data: { body: ContactList.TGetContactListResponse } = await mailjet
        .get('contactslist?Name=sigle', { version: 'v3' })
        .request();
      if (data.body.Count >= 1) {
        mailjetList = data.body.Data.find((list) => list.Name === 'sigle');
      }
      if (!mailjetList) {
        const contactList: ContactList.IPostContactListBody = {
          Name: 'sigle',
        };
        const data: { body: ContactList.TPostContactListResponse } =
          await mailjet
            .post('contactslist', { version: 'v3' })
            .request(contactList);
        mailjetList = data.body.Data[0];
      }
    } catch (error) {
      if (error.statusCode === 401) {
        throw new BadRequestException('Invalid Maijet api and/or secret key.');
      }
      throw error;
    }

    return {
      listId: mailjetList.ID,
      listAddress: mailjetList.Address,
    };
  }
}
