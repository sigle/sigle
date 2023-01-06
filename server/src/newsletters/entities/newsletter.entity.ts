import { ApiProperty } from '@nestjs/swagger';

export class NewsletterEntity {
  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  mailjetApiKey: string;

  @ApiProperty()
  mailjetApiSecret: string;
}
