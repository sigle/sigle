import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email/email.service';
import { PosthogService } from '../posthog/posthog.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailVerificationService } from './email-verification.service';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NEXTAUTH_SECRET') {
                return 'secret';
              }
              return null;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: PosthogService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EmailVerificationService>(EmailVerificationService);
  });

  describe('sendVerificationLink', () => {
    it('should return the url', async () => {
      const { url } = await service.sendVerificationLink({
        email: 'hello@sigle.io',
      });
      expect(url).toBeDefined();
    });
  });

  describe('decodeVerificationToken', () => {
    it('should throw on invalid token', async () => {
      try {
        service.decodeVerificationToken({ token: 'token' });
        throw new Error();
      } catch (error) {
        expect(error).toEqual(
          new BadRequestException('Invalid verification token'),
        );
      }
    });

    it('should decode the email from the token', async () => {
      const { token } = await service.sendVerificationLink({
        email: 'hello@sigle.io',
      });
      const payload = service.decodeVerificationToken({ token });
      expect(payload).toEqual({ email: 'hello@sigle.io' });
    });
  });
});
