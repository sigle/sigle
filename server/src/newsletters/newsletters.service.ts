import { BadRequestException, Injectable } from '@nestjs/common';
import { ContactList } from 'node-mailjet';
import { SubscriptionService } from '../subscription/subscription.service';
import { PrismaService } from '../prisma/prisma.service';
import { PosthogService } from '../posthog/posthog.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mailjet = require('node-mailjet');

@Injectable()
export class NewslettersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly posthog: PosthogService,
  ) {}

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
    const activeSubscription =
      await this.subscriptionService.getUserActiveSubscription({
        stacksAddress,
      });
    if (!activeSubscription) {
      throw new BadRequestException('No active subscription.');
    }

    const user = await this.prisma.user.findFirstOrThrow({
      select: {
        id: true,
        newsletter: {
          select: {
            id: true,
            mailjetApikey: true,
            mailjetApiSecret: true,
            mailjetListId: true,
            mailjetListAddress: true,
          },
        },
      },
      where: { stacksAddress },
    });

    const upsertData = {
      userId: user.id,
      status: enabled ? ('ACTIVE' as const) : ('INACTIVE' as const),
      mailjetApikey: apiKey,
      mailjetApiSecret: apiSecret,
      mailjetListId: user.newsletter?.mailjetListId ?? 0,
      mailjetListAddress: user.newsletter?.mailjetListAddress ?? '',
    };

    // Validate the config and setup the account if something changed or if it's the first time.
    const hasMailjetConfigChanged =
      user.newsletter?.mailjetApikey !== apiKey ||
      user.newsletter?.mailjetApiSecret !== apiSecret;
    if (hasMailjetConfigChanged) {
      const { listId, listAddress } = await this.validateAndSetupMailjetConfig({
        apiKey,
        apiSecret,
      });
      upsertData.mailjetListId = listId;
      upsertData.mailjetListAddress = listAddress;
    }

    await this.prisma.newsletter.upsert({
      select: {
        id: true,
      },
      where: { userId: user.id },
      create: upsertData,
      update: upsertData,
    });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: user.newsletter ? 'newsletter updated' : 'newsletter created',
      properties: {
        hasMailjetConfigChanged,
      },
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
    } catch (error) {
      if (error.statusCode === 401) {
        throw new BadRequestException('Invalid Mailjet credentials.');
      }
      throw error;
    }

    if (!mailjetList) {
      const contactList: ContactList.IPostContactListBody = {
        Name: 'sigle',
      };
      const data: { body: ContactList.TPostContactListResponse } = await mailjet
        .post('contactslist', { version: 'v3' })
        .request(contactList);
      mailjetList = data.body.Data[0];
    }

    return {
      listId: mailjetList.ID,
      listAddress: mailjetList.Address,
    };
  }
}
