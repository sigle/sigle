# Sigle API

## Endpoints

### Stats historical data

`https://app.sigle.io/api/analytics/historical` - Get the historical statistics.

Sample Response:

```json
{
  "2022-04-29": {
    "visits": 0,
    "pageviews": 0
  },
  "2022-04-30": {
    "visits": 0,
    "pageviews": 0
  }
  // ...
}
```

#### Parameters

- `dateFrom` - The date from which to get the statistics.
