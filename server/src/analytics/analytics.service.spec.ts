import { CACHE_MANAGER } from '@nestjs/cache-manager';
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
          useValue: {},
        },
        {
          provide: SubscriptionService,
          useValue: {
            getUserActiveSubscription: () => () => ({
              id: 'test',
            }),
          },
        },
        {
          provide: StacksService,
          useValue: {
            getUsernameByAddress: () => 'sigle.btc',
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
            timeseries: jest.fn(),
            pages: jest.fn(),
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
        paths: ['/sigle.btc/test'],
      });
      expect(data).toMatchSnapshot();
    });
  });

  describe('historical', () => {
    it('should return a formatted time series for days', async () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
      const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
      (plausibleService.timeseries as jest.Mock).mockResolvedValueOnce([
        {
          visitors: '5',
          pageviews: '1',
          date: '2022-03-20',
        },
        {
          visitors: '7',
          pageviews: '3',
          date: '2022-03-20',
        },
      ]);
      (plausibleService.pages as jest.Mock).mockResolvedValueOnce([
        {
          visitors: '5',
          pageviews: '1',
          page: '/test.btc/path-test',
        },
        {
          visitors: '7',
          pageviews: '3',
          page: '/test.btc/path-test-2',
        },
      ]);

      const data = await service.historical({
        stacksAddress,
        dateFrom: '2022-03-15',
        dateGrouping: 'day',
      });
      expect(plausibleService.timeseries).toBeCalledWith({
        dateFrom: '2022-05-01',
        dateGrouping: 'day',
        dateTo: '2022-04-04',
        paths: expect.any(Array),
      });
      expect(plausibleService.pages).toBeCalledWith({
        dateFrom: '2022-05-01',
        dateTo: '2022-04-04',
        paths: expect.any(Array),
      });
      expect(data).toMatchSnapshot();
    });

    it('should return a formatted time series for months', async () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
      const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
      (plausibleService.timeseries as jest.Mock).mockResolvedValueOnce([
        {
          visitors: '5',
          pageviews: '1',
          date: '2022-03-01',
        },
      ]);
      (plausibleService.pages as jest.Mock).mockResolvedValueOnce([
        {
          visitors: '5',
          pageviews: '1',
          page: '/test.btc/path-test',
        },
        {
          visitors: '7',
          pageviews: '3',
          page: '/test.btc/path-test-2',
        },
      ]);

      const data = await service.historical({
        stacksAddress,
        dateFrom: '2022-01-02',
        dateGrouping: 'month',
      });
      expect(plausibleService.timeseries).toBeCalledWith({
        dateFrom: '2022-05-01',
        dateGrouping: 'day',
        dateTo: '2022-04-04',
        paths: expect.any(Array),
      });
      expect(plausibleService.pages).toBeCalledWith({
        dateFrom: '2022-05-01',
        dateTo: '2022-04-04',
        paths: expect.any(Array),
      });
      expect(data).toMatchSnapshot();
    });

    it('should return a formatted time series for one story', async () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
      const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
      (plausibleService.timeseries as jest.Mock).mockResolvedValueOnce([
        {
          visitors: '5',
          pageviews: '1',
          date: '2022-03-01',
        },
      ]);
      (plausibleService.pages as jest.Mock).mockResolvedValueOnce([
        {
          visitors: '5',
          pageviews: '1',
          page: '/test.btc/path-test',
        },
      ]);

      const data = await service.historical({
        stacksAddress,
        dateFrom: '2022-03-15',
        dateGrouping: 'day',
        storyId: 'test',
      });
      expect(plausibleService.timeseries).toBeCalledWith({
        dateFrom: '2022-05-01',
        dateGrouping: 'day',
        dateTo: '2022-04-04',
        paths: expect.any(Array),
      });
      expect(plausibleService.pages).toBeCalledWith({
        dateFrom: '2022-05-01',
        dateTo: '2022-04-04',
        paths: expect.any(Array),
      });
      expect(data).toMatchSnapshot();
    });
  });
});
