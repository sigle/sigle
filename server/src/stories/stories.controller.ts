import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { PublishStoryDto } from './dto/publishStory.dto';
import { AuthGuard } from '../auth.guard';
import { UnpublishStoryDto } from './dto/unpublishStory.dto';

@ApiTags('stories')
@Controller()
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @UseGuards(AuthGuard)
  @Post('/api/stories/publish')
  @HttpCode(200)
  publish(@Request() req, @Body() publishStoryDto: PublishStoryDto) {
    return this.storiesService.publish({
      stacksAddress: req.user.stacksAddress,
      gaiaId: publishStoryDto.id,
      send: publishStoryDto.send,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/api/stories/unpublish')
  @HttpCode(200)
  unpublish(@Request() req, @Body() publishStoryDto: UnpublishStoryDto) {
    return this.storiesService.unpublish({
      stacksAddress: req.user.stacksAddress,
      gaiaId: publishStoryDto.id,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/api/stories/delete')
  @HttpCode(200)
  delete(@Request() req, @Body() publishStoryDto: UnpublishStoryDto) {
    return this.storiesService.delete({
      stacksAddress: req.user.stacksAddress,
      gaiaId: publishStoryDto.id,
    });
  }
}
