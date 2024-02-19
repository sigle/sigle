import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { validate } from 'deep-email-validator';
import { PrismaService } from '../prisma/prisma.service';
import { EnvironmentVariables } from '../environment/environment.validation';
import { PosthogService } from '../posthog/posthog.service';
import { EmailService } from '../email/email.service';

interface EmailVerificationToken {
  email: string;
}

@Injectable()
export class EmailVerificationService {
  private readonly tokenExpiresIn = '1h';

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly prisma: PrismaService,
    private readonly posthog: PosthogService,
    private readonly emailService: EmailService,
  ) {}

  async addEmail({
    stacksAddress,
    email,
  }: {
    stacksAddress: string;
    email: string;
  }): Promise<void> {
    email = email.toLowerCase();

    const user = await this.prisma.user.findUniqueOrThrow({
      select: { id: true, email: true, emailVerified: true },
      where: { stacksAddress },
    });
    // If the email is already set, do nothing
    if (email === user.email) {
      return;
    }
    const emailAlreadyUsed = await this.prisma.user.findFirst({
      select: { id: true },
      where: { email },
    });
    // If the email is already used by another user, do nothing to prevent email enumeration
    if (emailAlreadyUsed) {
      return;
    }

    // Quick verify email
    const res = await validate({
      email,
      // This is already checked by the router
      validateRegex: false,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      // Ideally we want to set this one to true.
      // But because of many false positives we disabled it.
      validateSMTP: false,
    });
    if (!res.valid) {
      throw new BadRequestException('Invalid email.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        emailVerified: null,
      },
    });

    await this.sendVerificationLink({ email });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'email added',
      properties: {
        alreadyHadEmail: !!user.email,
      },
    });
  }

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
    const token = jwt.sign(
      payload,
      this.configService.get('NEXTAUTH_SECRET') as string,
      {
        algorithm: 'HS256',
        expiresIn: this.tokenExpiresIn,
      },
    );
    const verifyEmailUrl = `${this.configService.get(
      'APP_URL',
    )}/verify-email/${token}`;
    if (process.env.NODE_ENV !== 'test') {
      const html = this.emailService.generateVerifyEmailTemplate({
        verifyEmailUrl,
      });
      await this.emailService.sendMail({
        to: email,
        subject: 'Verify your email address',
        text: `To confirm your email address, click here: ${verifyEmailUrl}`,
        html: html,
      });
    }

    return { url: verifyEmailUrl, token };
  }

  /**
   * Decode a verification token and return the email address associated with it.
   * Will throw an error if the token is invalid or expired.
   */
  decodeVerificationToken({
    token,
  }: {
    token: string;
  }): EmailVerificationToken {
    try {
      const payload = jwt.verify(
        token,
        this.configService.get('NEXTAUTH_SECRET') as string,
        {
          algorithms: ['HS256'],
          maxAge: this.tokenExpiresIn,
        },
      );
      if (typeof payload === 'object' && 'email' in payload) {
        return { email: payload.email };
      }
      throw new InternalServerErrorException();
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
      select: { id: true, stacksAddress: true, emailVerified: true },
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

    this.posthog.capture({
      distinctId: user.stacksAddress,
      event: 'email verified',
      properties: {},
    });
  }

  async resendVerificationLink({ stacksAddress }: { stacksAddress: string }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { stacksAddress },
      select: { id: true, email: true, emailVerified: true },
    });
    if (!user.email) {
      throw new BadRequestException('No email set');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.sendVerificationLink({ email: user.email });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'email verification link resent',
      properties: {},
    });
  }
}
