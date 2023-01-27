import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../auth.guard';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { EmailVerificationService } from './email-verification.service';

@ApiTags('user')
@Controller()
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @ApiOperation({
    description: 'Verify a user email address.',
  })
  @ApiOkResponse({ type: Boolean })
  @Throttle(5, 60)
  @Post('/api/email-verification/verify')
  @HttpCode(200)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    const payload = this.emailVerificationService.decodeVerificationToken({
      token: verifyEmailDto.token,
    });
    await this.emailVerificationService.verifyEmail({
      email: payload.email,
    });
  }

  @ApiOperation({
    description: 'Resend link to verify a user email address.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @Throttle(2, 60)
  @UseGuards(AuthGuard)
  @Post('/api/email-verification/resend')
  @HttpCode(200)
  async resendEmail(@Request() req): Promise<void> {
    await this.emailVerificationService.resendVerificationLink({
      stacksAddress: req.user.stacksAddress,
    });
  }
}
