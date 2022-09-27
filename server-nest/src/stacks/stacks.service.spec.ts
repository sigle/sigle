import { CACHE_MANAGER } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StacksService } from './stacks.service';

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
});
