import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
  }

  /**
   *
   */
  private validateMailjetConfig({
    apiKey,
    apiSecret,
  }: {
    apiKey: string;
    apiSecret: string;
  }): boolean {
    // TODO call mailjet api to verify keys are working
    return true;
  }
}
