import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { PublishStoryDto } from './dto/publishStory.dto';
import { AuthGuard } from '../auth.guard';
import { UnpublishStoryDto } from './dto/unpublishStory.dto';
import { StoryDto } from './dto/story.dto';
import { SendTestStoryDto } from './dto/send-test-story.dto';

@ApiTags('stories')
@Controller()
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @UseGuards(AuthGuard)
  @Get('/api/stories/:storyId')
  @HttpCode(200)
  @ApiOkResponse({
    type: StoryDto,
  })
  get(@Request() req, @Param('storyId') storyId: string): Promise<StoryDto> {
    return this.storiesService.get({
      stacksAddress: req.user.stacksAddress,
      gaiaId: storyId,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/api/stories/send-test')
  @HttpCode(200)
  sendTest(@Request() req, @Body() publishStoryDto: SendTestStoryDto) {
    return this.storiesService.sendTestStory({
      stacksAddress: req.user.stacksAddress,
      gaiaId: publishStoryDto.id,
      emails: publishStoryDto.emails,
      storyTitle: publishStoryDto.storyTitle,
      storyContent: publishStoryDto.storyContent,
      storyCoverImage: publishStoryDto.storyCoverImage,
    });
  }

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
