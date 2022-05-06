import { analyticsHistoricalEndpoint } from './historical.api';

it('Should throw an error if dateFrom is missing', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: {} } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateFrom is required' });
});

it('Should throw an error if dateFrom is invalid', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: 'invalid' } } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateFrom is invalid' });
});

it('Should throw an error if dateGrouping is missing', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: '2022-05-04' } } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateGrouping is required' });
});

it('Should throw an error if dateGrouping is invalid', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: '2022-05-04', dateGrouping: 'invalid' } } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateGrouping must be day or month' });
});
