import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Request,
  Get,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NewslettersService } from './newsletters.service';
import { UpdateNewsletterDto } from './dto/updateNewsletter.dto';
import { AuthGuard } from '../auth.guard';
import { NewsletterEntity } from './entities/newsletter.entity';

@ApiTags('newsletters')
@Controller()
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @UseGuards(AuthGuard)
  @Get('/api/newsletters')
  @ApiOkResponse({
    type: NewsletterEntity,
  })
  get(@Request() req): Promise<NewsletterEntity | null> {
    return this.newslettersService.get({
      stacksAddress: req.user.stacksAddress,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/api/newsletters')
  @HttpCode(200)
  update(@Request() req, @Body() updateNewsletterDto: UpdateNewsletterDto) {
    return this.newslettersService.update({
      stacksAddress: req.user.stacksAddress,
      apiKey: updateNewsletterDto.apiKey,
      apiSecret: updateNewsletterDto.apiSecret,
    });
  }

  @UseGuards(AuthGuard)
  @Get('/api/newsletters/contacts-lists')
  @ApiOkResponse({})
  getContactsLists(@Request() req): Promise<any | null> {
    return this.newslettersService.getContactsLists({
      stacksAddress: req.user.stacksAddress,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/api/newsletters/sender')
  @HttpCode(200)
  syncSender(@Request() req) {
    return this.newslettersService.syncSender({
      stacksAddress: req.user.stacksAddress,
    });
  }
}
