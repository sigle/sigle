import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GaiaService } from './gaia.service';
import { SubsetStoryEntity } from './entities/subsetStory.entity';

@ApiTags('gaia')
@Controller()
export class GaiaController {
  constructor(private readonly gaiaService: GaiaService) {}

  @ApiOperation({
    description: 'Returns the stories stored in Gaia.',
  })
  @ApiOkResponse({
    type: SubsetStoryEntity,
    isArray: true,
  })
  @Get('/api/gaia/:username/stories')
  getUserFollowing(
    @Param('username') username: string,
  ): Promise<SubsetStoryEntity[]> {
    return this.gaiaService.getUserStories({ username });
  }
}
