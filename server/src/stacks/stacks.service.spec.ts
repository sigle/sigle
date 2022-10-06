import { CACHE_MANAGER } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { fetch } from 'undici';
import { StacksService } from './stacks.service';

// micro-stacks require a global fetch function
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.fetch = fetch;

describe('StacksService', () => {
  let service: StacksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StacksService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => null,
            set: () => () => null,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'APP_URL') {
                return 'https://app.sigle.io';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StacksService>(StacksService);
  });

  describe('getUsernameByAddress', () => {
    it('should throw an error if no username found', async () => {
      await expect(
        service.getUsernameByAddress(
          'SP2XTR7ZK886AJB0HNHNF244NBGZ0MG1P5PH8SB1C',
        ),
      ).rejects.toThrowError(
        'No username found for SP2XTR7ZK886AJB0HNHNF244NBGZ0MG1P5PH8SB1C',
      );
    });

    it('should return correct username', async () => {
      expect(
        await service.getUsernameByAddress(
          'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q',
        ),
      ).toEqual('leopradel.btc');
    });
  });

  describe('getBucketUrl', () => {
    it('should return undefined if user not using the app', async () => {
      expect(await service.getBucketUrl({ username: 'stxstats.btc' })).toEqual({
        bucketUrl: undefined,
        profile: expect.any(Object),
      });
    });

    it('should return undefined if user not using the app', async () => {
      expect(await service.getBucketUrl({ username: 'leopradel.btc' })).toEqual(
        {
          bucketUrl: expect.any(String),
          profile: expect.any(Object),
        },
      );
    });
  });
});
