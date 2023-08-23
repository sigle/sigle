import { BadRequestException, Injectable } from '@nestjs/common';
import { ContactList, Sender } from 'node-mailjet';
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

  async get({ stacksAddress }: { stacksAddress: string }) {
    const newsletter = await this.prisma.newsletter.findFirst({
      select: {
        id: true,
        status: true,
        mailjetApiKey: true,
        mailjetApiSecret: true,
        senderEmail: true,
      },
      where: { user: { stacksAddress } },
    });
    return newsletter
      ? {
          mailjetApiKey: newsletter.mailjetApiKey,
          mailjetApiSecret: newsletter.mailjetApiSecret,
          senderEmail: newsletter.senderEmail,
          status: newsletter.status,
        }
      : null;
  }

  async update({
    stacksAddress,
    apiKey,
    apiSecret,
  }: {
    stacksAddress: string;
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

    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        newsletter: {
          select: {
            id: true,
            mailjetApiKey: true,
            mailjetApiSecret: true,
            mailjetListId: true,
            senderEmail: true,
          },
        },
      },
      where: { stacksAddress },
    });

    const upsertData = {
      userId: user.id,
      status: user.newsletter?.senderEmail
        ? ('ACTIVE' as const)
        : ('INACTIVE' as const),
      mailjetApiKey: apiKey,
      mailjetApiSecret: apiSecret,
      mailjetListId: user.newsletter?.mailjetListId ?? 0,
    };

    // Validate the config and setup the account if something changed or if it's the first time.
    const hasMailjetConfigChanged =
      user.newsletter?.mailjetApiKey !== apiKey ||
      user.newsletter?.mailjetApiSecret !== apiSecret;
    if (hasMailjetConfigChanged) {
      const { listId } = await this.validateAndSetupMailjetConfig({
        apiKey,
        apiSecret,
      });
      upsertData.mailjetListId = listId;
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
   * Get the Mailjet contact lists and show the selected one.
   */
  async getContactsLists({ stacksAddress }: { stacksAddress: string }) {
    const activeSubscription =
      await this.subscriptionService.getUserActiveSubscription({
        stacksAddress,
      });
    if (!activeSubscription) {
      throw new BadRequestException('No active subscription.');
    }

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

    const mailjet = new Mailjet({
      apiKey: user.newsletter.mailjetApiKey,
      apiSecret: user.newsletter.mailjetApiSecret,
    });

    const data: { body: ContactList.TGetContactListResponse } = await mailjet
      .get('contactslist', { version: 'v3' })
      .request();

    return data.body.Data.map((list) => ({
      id: list.ID,
      name: list.Name,
      isSelected: list.ID === user.newsletter.mailjetListId,
      isDeleted: list.IsDeleted,
      subscriberCount: list.SubscriberCount,
    }));
  }

  /**
   * Change the selected list where emails are being sent.
   */
  async updateContactsList({
    stacksAddress,
    listId,
  }: {
    stacksAddress: string;
    listId: number;
  }): Promise<void> {
    const activeSubscription =
      await this.subscriptionService.getUserActiveSubscription({
        stacksAddress,
      });
    if (!activeSubscription) {
      throw new BadRequestException('No active subscription.');
    }

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

    const mailjet = new Mailjet({
      apiKey: user.newsletter.mailjetApiKey,
      apiSecret: user.newsletter.mailjetApiSecret,
    });

    const data: { body: ContactList.TGetContactListResponse } = await mailjet
      .get('contactslist', { version: 'v3' })
      .id(listId)
      .request();
    if (data.body.Count === 0) {
      throw new BadRequestException('List not found.');
    }

    await this.prisma.newsletter.update({
      where: { id: user.newsletter.id },
      data: { mailjetListId: listId },
    });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'newsletter list selected',
      properties: {
        listId,
      },
    });
  }

  /**
   * Get the Mailjet active senders and show the selected one.
   */
  async getSenders({ stacksAddress }: { stacksAddress: string }) {
    const activeSubscription =
      await this.subscriptionService.getUserActiveSubscription({
        stacksAddress,
      });
    if (!activeSubscription) {
      throw new BadRequestException('No active subscription.');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        newsletter: {
          select: {
            id: true,
            senderEmail: true,
            mailjetApiKey: true,
            mailjetApiSecret: true,
          },
        },
      },
      where: { stacksAddress },
    });
    if (!user.newsletter) {
      throw new BadRequestException('Newsletter not setup.');
    }

    const mailjet = new Mailjet({
      apiKey: user.newsletter.mailjetApiKey,
      apiSecret: user.newsletter.mailjetApiSecret,
    });

    const data: { body: Sender.TGetSenderResponse } = await mailjet
      .get('sender', { version: 'v3' })
      .request();

    const activeSenders = data.body.Data.filter(
      (sender) => sender.Status === 'Active',
    );
    return activeSenders.map((sender) => ({
      id: sender.ID,
      email: sender.Email,
      isSelected: sender.Email === user.newsletter.senderEmail,
    }));
  }

  /**
   * Sync the sender email with the one in Mailjet.
   * This is required because the sender email can be changed in Mailjet.
   */
  async updateSender({
    stacksAddress,
    senderId,
  }: {
    stacksAddress: string;
    senderId: number;
  }): Promise<void> {
    const activeSubscription =
      await this.subscriptionService.getUserActiveSubscription({
        stacksAddress,
      });
    if (!activeSubscription) {
      throw new BadRequestException('No active subscription.');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        newsletter: {
          select: {
            id: true,
            mailjetApiKey: true,
            mailjetApiSecret: true,
            senderEmail: true,
          },
        },
      },
      where: { stacksAddress },
    });
    if (!user.newsletter) {
      throw new BadRequestException('Newsletter not setup.');
    }

    const mailjet = new Mailjet({
      apiKey: user.newsletter.mailjetApiKey,
      apiSecret: user.newsletter.mailjetApiSecret,
    });

    const data: { body: Sender.TGetSenderResponse } = await mailjet
      .get('sender', { version: 'v3' })
      .request();

    const sender = data.body.Data.find((sender) => sender.ID === senderId);
    if (!sender) {
      throw new BadRequestException('Sender not found.');
    }
    if (sender.Status !== 'Active') {
      throw new BadRequestException(
        'Sender is not active, please verify it on Mailjet.',
      );
    }

    await this.prisma.newsletter.update({
      where: { userId: user.id },
      data: {
        senderEmail: sender.Email,
        status: 'ACTIVE',
      },
    });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'newsletter sender updated',
      properties: {
        senderId,
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
  }): Promise<{ listId: number }> {
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
    };
  }
}
