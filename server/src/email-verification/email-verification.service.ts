import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { EnvironmentVariables } from '../environment/environment.validation';

interface EmailVerificationToken {
  email: string;
}

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generate a new link to verify an user email and send it.
   * The token expires after 10 mins.
   */
  async sendVerificationLink({
    email,
  }: {
    email: string;
  }): Promise<{ url: string; token: string }> {
    const payload: EmailVerificationToken = { email };
    const token = jwt.sign(payload, this.configService.get('NEXTAUTH_SECRET'), {
      algorithm: 'HS256',
      expiresIn: '10m',
    });
    const url = `${this.configService.get('APP_URL')}/verify-email/${token}`;
    const text = `To confirm the email address, click here: ${url}`;
    console.log(`----\n${text}`);
    return { url, token };
  }

  decodeVerificationToken({
    token,
  }: {
    token: string;
  }): EmailVerificationToken {
    try {
      const payload = jwt.verify(
        token,
        this.configService.get('NEXTAUTH_SECRET'),
        {
          algorithms: ['HS256'],
          maxAge: '10m',
        },
      );
      if (typeof payload === 'object' && 'email' in payload) {
        return { email: payload.email };
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email verification token expired');
      }
      throw new BadRequestException('Invalid verification token');
    }
  }

  async verifyEmail({ email }: { email: string }) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { email },
      select: { id: true, emailVerified: true },
    });
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });
  }

  async resendVerificationLink({ stacksAddress }: { stacksAddress: string }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { stacksAddress },
      select: { id: true, email: true, emailVerified: true },
    });
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }
    await this.sendVerificationLink({ email: user.email });
  }
}
