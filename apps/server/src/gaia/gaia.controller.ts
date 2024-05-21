import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GaiaService } from './gaia.service';
import { SubsetStoryEntity } from './entities/subsetStory.entity';
import { StoryEntity } from './entities/story.entity';
import { SettingsEntity } from './entities/settings.entity';
import { UserInfoEntity } from './entities/userInfo.entity';

@ApiTags('gaia')
@Controller()
export class GaiaController {
  constructor(private readonly gaiaService: GaiaService) {}

  @ApiOperation({
    description:
      'Returns the user blockchain info. Response is cached for 1 minute.',
  })
  @ApiOkResponse({
    type: UserInfoEntity,
  })
  @Get('/api/gaia/:username/info')
  getUserInfo(
    @Param('username') username: string,
  ): Promise<UserInfoEntity | null> {
    return this.gaiaService.getUserInfo({ username });
  }

  @ApiOperation({
    description:
      'Returns the stories stored in Gaia. Response is cached for 1 minute.',
  })
  @ApiOkResponse({
    type: SubsetStoryEntity,
    isArray: true,
  })
  @Get('/api/gaia/:username/stories')
  getUserStories(
    @Param('username') username: string,
  ): Promise<SubsetStoryEntity[]> {
    return this.gaiaService.getUserStories({ username });
  }

  @ApiOperation({
    description:
      'Returns the story stored in Gaia. Response is cached for 1 minute.',
  })
  @ApiOkResponse({
    type: SubsetStoryEntity,
  })
  @Get('/api/gaia/:username/stories/:storyId')
  getUserStory(
    @Param('username') username: string,
    @Param('storyId') storyId: string,
  ): Promise<StoryEntity | null> {
    return this.gaiaService.getUserStory({ username, storyId });
  }

  @ApiOperation({
    description:
      'Returns the settings stored in Gaia. Response is cached for 1 minute.',
  })
  @ApiOkResponse({
    type: SettingsEntity,
  })
  @Get('/api/gaia/:username/settings')
  getUserSettings(
    @Param('username') username: string,
  ): Promise<SettingsEntity | null> {
    return this.gaiaService.getUserSettings({ username });
  }
}
