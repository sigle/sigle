import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { UpdateNewsletterDto } from './dto/updateNewsletter.dto';

@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Post()
  update(@Body() updateNewsletterDto: UpdateNewsletterDto) {
    return this.newslettersService.update(updateNewsletterDto);
  }
}
