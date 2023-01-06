import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewslettersService } from './newsletters.service';
import { UpdateNewsletterDto } from './dto/updateNewsletter.dto';
import { AuthGuard } from '../auth.guard';

@ApiTags('newsletters')
@Controller()
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @UseGuards(AuthGuard)
  @Post('/api/newsletters')
  @HttpCode(200)
  update(@Request() req, @Body() updateNewsletterDto: UpdateNewsletterDto) {
    return this.newslettersService.update({
      stacksAddress: req.user.stacksAddress,
      enabled: updateNewsletterDto.enabled,
      apiKey: updateNewsletterDto.apiKey,
      apiSecret: updateNewsletterDto.apiSecret,
    });
  }
}
