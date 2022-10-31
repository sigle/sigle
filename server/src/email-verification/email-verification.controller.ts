import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @Post('/api/email-verification/verify')
  @HttpCode(200)
  async addEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    // TODO rate limit
    const payload = this.emailVerificationService.decodeVerificationToken({
      token: verifyEmailDto.token,
    });
    await this.emailVerificationService.verifyEmail({
      email: payload.email,
    });
  }
}
