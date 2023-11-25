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

@ApiTags('domains')
@Controller()
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

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
