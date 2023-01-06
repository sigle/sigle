import { ApiProperty } from '@nestjs/swagger';

export class NewsletterEntity {
  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  mailjetApikey: string;

  @ApiProperty()
  mailjetApiSecret: string;
}
