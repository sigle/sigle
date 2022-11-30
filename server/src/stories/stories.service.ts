import { Injectable } from '@nestjs/common';
import { PublishStoryDto } from './dto/publishStory.dto';

@Injectable()
export class StoriesService {
  publish(publishStoryDto: PublishStoryDto) {
    return 'This action adds a new story';
  }
}
