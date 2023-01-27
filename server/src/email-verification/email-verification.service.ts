import { randomBytes } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { EnvironmentVariables } from '../environment/environment.validation';
import { PosthogService } from '../posthog/posthog.service';
import { EmailService } from '../email/email.service';

interface EmailVerificationToken {
  email: string;
}

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly prisma: PrismaService,
    private readonly posthog: PosthogService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate a new link to verify an user email and send it.
   */
  async sendVerificationLink({
    stacksAddress,
    email,
  }: {
    stacksAddress: string;
    email: string;
  }): Promise<{ url: string; token: string }> {
    const token = this.generateRandomToken();
    email = email.toLowerCase();

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { stacksAddress },
      select: { id: true, email: true, emailVerified: true },
    });

    // Do not send an email if the address is already verified
    if (email === user.email) {
      throw new BadRequestException('Email address already verified');
    }

    // Delete any existing token for this user
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        email,
      },
    });

    const url = `${this.configService.get('APP_URL')}/verify-email/${token}`;

    await this.emailService.sendMail({
      // TODO from
      from: '"Fred Foo 👻" <foo@example.com>',
      to: email,
      // TODO subject
      subject: 'Hello ✔',
      // TODO text
      text: `To confirm the email address, click here: ${url}`,
      // TODO html
      html: `<p>To confirm the email address, click here: ${url}</p>`,
    });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'send verification link',
      properties: {},
    });

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
    await this.sendVerificationLink({
      stacksAddress: 'TODO',
      email: user.email,
    });
  }

  private generateRandomToken(length = 43): string {
    return randomBytes(length).toString('hex');
  }
}
