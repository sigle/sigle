import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DismissableFlags } from '../dismissable-flags.service';

export class UpdateDismissableFlagsDto {
  @IsEnum(DismissableFlags)
  @ApiProperty()
  dismissableFlag: number;
}
