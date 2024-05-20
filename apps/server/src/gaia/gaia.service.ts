import { StacksService } from '@/stacks/stacks.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GaiaService {
  constructor(private readonly stacksService: StacksService) {}

  async getUserStories({ username }: { username: string }) {
    // TODO caching mechanism
    const { bucketUrl } = await this.stacksService.getBucketUrl({
      username,
    });

    if (!bucketUrl) {
      return [];
    }

    const publicStoriesFile = await this.stacksService.getPublicStories({
      bucketUrl,
    });

    return publicStoriesFile;
  }
}
