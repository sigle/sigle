import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './env.validation';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate, cache: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
