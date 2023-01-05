import { Injectable } from '@nestjs/common';
import { UpdateNewsletterDto } from './dto/updateNewsletter.dto';

@Injectable()
export class NewslettersService {
  update(updateNewsletterDto: UpdateNewsletterDto) {}
}
