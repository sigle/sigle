import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../environment/environment.validation';

@Injectable()
export class PlausibleService {
  private siteId: string;
  private apiToken: string;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.siteId = this.configService.get('PLAUSIBLE_SITE_ID');
    this.apiToken = this.configService.get('PLAUSIBLE_API_TOKEN');
  }

  async pages(params: {
    dateFrom: string;
    dateTo: string;
    paths: string[];
  }): Promise<
    {
      page: string;
      pageviews: number;
      visitors: number;
    }[]
  > {
    const urlParams = new URLSearchParams({
      period: 'custom',
      date: `${params.dateFrom},${params.dateTo}`,
      property: 'event:page',
      filters: `event:page==${params.paths.join('|')}`,
      metrics: 'visitors,pageviews',
    });

    const data = await this.fetch('/stats/breakdown', urlParams);
    return data.results;
  }

  async referrers(params: {
    dateFrom: string;
    dateTo: string;
    paths: string[];
  }): Promise<
    {
      source: string;
      pageviews: number;
      visitors: number;
    }[]
  > {
    const urlParams = new URLSearchParams({
      period: 'custom',
      date: `${params.dateFrom},${params.dateTo}`,
      property: 'visit:source',
      filters: `event:page==${params.paths.join('|')}`,
      metrics: 'visitors,pageviews',
    });

    const data = await this.fetch('/stats/breakdown', urlParams);
    return data.results;
  }

  async timeseries(params: {
    dateGrouping: 'day' | 'month';
    dateFrom: string;
    dateTo: string;
    paths: string[];
  }): Promise<
    {
      date: string;
      pageviews: number;
      visitors: number;
    }[]
  > {
    const urlParams = new URLSearchParams({
      period: 'custom',
      interval: params.dateGrouping === 'day' ? 'date' : 'month',
      date: `${params.dateFrom},${params.dateTo}`,
      filters: `event:page==${params.paths.join('|')}`,
      metrics: 'visitors,pageviews',
    });

    const data = await this.fetch('/stats/timeseries', urlParams);
    return data.results;
  }

  private async fetch(path: string, params: URLSearchParams): Promise<any> {
    params.append('site_id', this.siteId);

    const response = await fetch(
      `https://plausible.io/api/v1${path}?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    if (response.status !== 200) {
      console.error(await response.text());
      throw new Error(`Failed to fetch plausible api: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.json() as any;
  }
}
