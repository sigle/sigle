import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller()
export class AppController {
  @Throttle(150, 60)
  @Get('/health')
  getHello() {
    return {
      success: true,
    };
  }
}
