import { ApiProperty } from '@nestjs/swagger';

export class NewsletterEntity {
  @ApiProperty()
  mailjetApiKey: string;

  @ApiProperty()
  mailjetApiSecret: string;

  @ApiProperty({ nullable: true })
  senderEmail?: string;

  @ApiProperty()
  status: string;
}
