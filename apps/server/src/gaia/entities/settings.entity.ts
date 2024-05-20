import { ApiProperty } from '@nestjs/swagger';

export class SettingsEntity {
  @ApiProperty({ nullable: true })
  siteName?: string;
  @ApiProperty({ nullable: true })
  siteDescription?: string;
  @ApiProperty({ nullable: true })
  siteColor?: string;
  @ApiProperty({ nullable: true })
  siteLogo?: string;
  @ApiProperty({ nullable: true })
  siteUrl?: string;
  @ApiProperty({ nullable: true })
  siteTwitterHandle?: string;
}
