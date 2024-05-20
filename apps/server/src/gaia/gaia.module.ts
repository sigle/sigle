import { Module } from '@nestjs/common';
import { GaiaController } from './gaia.controller';
import { GaiaService } from './gaia.service';
import { StacksService } from '@/stacks/stacks.service';

@Module({
  controllers: [GaiaController],
  providers: [StacksService, GaiaService],
  imports: [],
})
export class GaiaModule {}
