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
import { ContactsListsEntity } from './entities/constacts-lists.entity';
import { UpdateContactsListDto } from './dto/updateContactsList.dto';
import { SenderEntity } from './entities/sender.entity';
import { UpdateSenderDto } from './dto/updateSender.dto';

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
  @ApiOkResponse({ type: ContactsListsEntity, isArray: true })
  getContactsLists(@Request() req): Promise<ContactsListsEntity[]> {
    return this.newslettersService.getContactsLists({
      stacksAddress: req.user.stacksAddress,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/api/newsletters/contacts-lists')
  @HttpCode(200)
  updateContactsList(
    @Request() req,
    @Body() updateNewsletterDto: UpdateContactsListDto,
  ) {
    return this.newslettersService.updateContactsList({
      stacksAddress: req.user.stacksAddress,
      listId: updateNewsletterDto.listId,
    });
  }

  @UseGuards(AuthGuard)
  @Get('/api/newsletters/senders')
  @ApiOkResponse({ type: SenderEntity, isArray: true })
  getSenders(@Request() req): Promise<SenderEntity[]> {
    return this.newslettersService.getSenders({
      stacksAddress: req.user.stacksAddress,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/api/newsletters/senders')
  @HttpCode(200)
  updateSender(@Request() req, @Body() updateNewsletterDto: UpdateSenderDto) {
    return this.newslettersService.updateSender({
      stacksAddress: req.user.stacksAddress,
      senderId: updateNewsletterDto.senderId,
    });
  }
}
