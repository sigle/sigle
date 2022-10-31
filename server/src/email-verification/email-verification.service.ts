import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { EnvironmentVariables } from '../environment/environment.validation';

interface EmailVerificationToken {
  email: string;
}

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async sendVerificationLink({ email }: { email: string }): Promise<void> {
    // const jwtSecret = crypto.randomBytes(16).toString('hex');

    const payload: EmailVerificationToken = { email };
    const token = jwt.sign(payload, this.configService.get('NEXTAUTH_SECRET'), {
      algorithm: 'HS256',
      expiresIn: '10m',
    });
    const url = `${this.configService.get('APP_URL')}/verify-email/${token}`;
    const text = `To confirm the email address, click here: ${url}`;
    console.log(`----\n${text}`);
  }

  // async confirmEmail(email: string) {
  //   //   /** @type any */
  //   //   const claims = jwt.verify(token, this.secret, {
  //   //     algorithms: ['HS256'],
  //   //     maxAge: '10m'
  //   // });
  //   // if (!claims || typeof claims === 'string') {
  //   //     // @TODO: throw a detailed error message here
  //   //     throw new UnauthorizedError();
  //   // }
  //   // const user = await this.usersService.getByEmail(email);
  //   // if (user.isEmailConfirmed) {
  //   //   throw new BadRequestException('Email already confirmed');
  //   // }
  //   // await this.usersService.markEmailAsConfirmed(email);
  // }
}
