import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { AuthGuard } from '../auth.guard';
import { UpdateDomainDto } from './dto/updateDomain.dto';
import { DomainEntity } from './entities/domain.entity';

@ApiTags('domains')
@Controller()
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @ApiOperation({
    description: 'Return the domain of the current user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    type: DomainEntity,
  })
  @UseGuards(AuthGuard)
  @Get('/api/domains/me')
  get(@Request() req): Promise<DomainEntity> {
    return this.domainsService.get({
      stacksAddress: req.user.stacksAddress,
    });
  }

  @ApiOperation({
    description: 'Update the custom domain of the current user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @UseGuards(AuthGuard)
  @Post('/api/domains/update')
  @HttpCode(200)
  update(
    @Request() req,
    @Body() updateDomainDto: UpdateDomainDto,
  ): Promise<boolean> {
    return this.domainsService.updateDomain({
      stacksAddress: req.user.stacksAddress,
      domain: updateDomainDto.domain,
    });
  }
}
