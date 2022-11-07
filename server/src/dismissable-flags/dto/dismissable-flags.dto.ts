import { ApiProperty } from '@nestjs/swagger';

export class DismissableFlags {
  @ApiProperty()
  id: string;

  @ApiProperty()
  onboarding: Date;
}
