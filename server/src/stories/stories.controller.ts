import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { PublishStoryDto } from './dto/publishStory.dto';

@ApiTags('stories')
@Controller()
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post('/api/stories/publish')
  publish(@Body() publishStoryDto: PublishStoryDto) {
    return this.storiesService.publish(publishStoryDto);
  }
}
