import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('/health')
  getHello() {
    return {
      success: true,
    };
  }
}
