# Sigle API

## Rate limits

We limit API requests to 50 requests per minute.

## Endpoints

### Create a creator plus subscription

`https://api.sigle.io/api/subscription/creatorPlus` - POST - Create a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.

Sample Response:

```json
{
  "success": "true"
}
```

#### Parameters

- **`nftId`** - The nft id to link the subscription to.

### Stats historical data

`https://api.sigle.io/api/analytics/historical` - Get the historical statistics.

Sample Response for days grouping:

```json
{
  "historical": [
    {
      "date": "2022-04-29",
      "visits": 0,
      "pageviews": 0
    },
    {
      "date": "2022-04-30",
      "visits": 0,
      "pageviews": 0
    }
    // ...
  ],
  "stories": [
    { "pathname": "zsoVIi3V6CE", "visits": 0, "pageviews": 0 },
    { "pathname": "0jE9PPqbxUp", "visits": 0, "pageviews": 0 }
    // ...
  ]
}
```

Sample Response for months grouping:

```json
{
  "historical": [
    {
      "date": "2022-03",
      "visits": 0,
      "pageviews": 0
    },
    {
      "date": "2022-04",
      "visits": 0,
      "pageviews": 0
    }
    // ...
  ]
}
```

#### Parameters

- **`dateFrom`** - The date from which to get the statistics (e.g. 2022-04-01).
- **`dateGrouping`** - The date grouping (e.g. day, month). When day is set the date format is YYYY-MM-DD. When month is set the date format is YYYY-MM.
- `storyId` - optional - The story id to get the statistics for.

### Stats referrers

`https://app.sigle.io/api/analytics/referrers` - Get the referrers statistics.

Sample Response:

```json
[
  { "domain": "twitter.com", "count": 0 },
  { "domain": "google.com", "count": 0 }
  // ...
]
```

#### Parameters

- **`dateFrom`** - The date from which to get the statistics (e.g. 2022-04-01).
- `storyId` - optional - The story id to get the statistics for.
