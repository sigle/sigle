import { CACHE_MANAGER } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PlausibleService } from '../plausible/plausible.service';
import { StacksService } from '../stacks/stacks.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let plausibleService: PlausibleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
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
              return null;
            }),
          },
        },
        {
          provide: SubscriptionService,
          useValue: {
            getUserActiveSubscription: () =>
              jest.fn(() => ({
                id: 'test',
              })),
          },
        },
        {
          provide: StacksService,
          useValue: {
            getUsernameByAddress: () => 'sigleapp.id.blockstack',
            getBucketUrl: () => ({
              profile: {},
              bucketUrl: 'https://www.sigle.io',
            }),
            getPublicStories: () => [],
          },
        },
        {
          provide: PlausibleService,
          useValue: {
            referrers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    plausibleService = await module.resolve(PlausibleService);
  });

  describe('referrers', () => {
    it('should return referrers', async () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
      const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
      (plausibleService.referrers as jest.Mock).mockResolvedValueOnce([
        {
          pageviews: '1',
          source: 'https://stacks.co',
        },
        {
          pageviews: '10',
          source: 'Direct / None',
        },
      ]);

      const data = await service.referrers({
        stacksAddress,
        dateFrom: '2022-03-15',
      });
      expect(plausibleService.referrers).toBeCalledWith({
        dateFrom: '2022-05-01',
        dateTo: '2022-04-04',
        paths: expect.any(Array),
      });
      expect(data).toMatchSnapshot();
    });

    it('should return referrers for one story', async () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
      const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
      (plausibleService.referrers as jest.Mock).mockResolvedValueOnce([
        {
          pageviews: '5',
          source: 'https://stacks.co',
        },
      ]);

      const data = await service.referrers({
        stacksAddress,
        dateFrom: '2022-03-15',
        storyId: 'test',
      });
      expect(plausibleService.referrers).toBeCalledWith({
        dateFrom: '2022-05-01',
        dateTo: '2022-04-04',
        paths: ['/sigleapp.id.blockstack/test'],
      });
      expect(data).toMatchSnapshot();
    });
  });
});
