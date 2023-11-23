import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller()
export class AppController {
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Get('/health')
  getHello() {
    return {
      success: true,
    };
  }
}
