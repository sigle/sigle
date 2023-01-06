import { ApiProperty } from '@nestjs/swagger';

export class NewsletterEntity {
  @ApiProperty()
  mailjetApiKey: string;

  @ApiProperty()
  mailjetApiSecret: string;
}
