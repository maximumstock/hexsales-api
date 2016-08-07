# v1 documentation

## Changelog

#### 2016-07-20

- Added `/stats/pricelist` resource - list of summary data (avg/min/max price, sold quantity) over different timespans for all articles at once

#### 2016-08-06

- Moved `/economy/mostsold` to `/stats/mostsold`
- Removed `/economy` endpoint
- Added `/histories` endpoint
- Added `/summaries` endpoint


## API Overview
Here is a short overview over this API and it's functionality.

* GET `/summaries`
This lets you query for summarizing data. With this endpoint you can for example answer questions like **"How many Vampire Kings were bought between 2016-01-01 and 2016-05-01 for Platinum?**

* GET `/histories`
This also lets you query for summarizing data, but aggregates the data by day. So you could answer questions like **"How many Vampire Kings were bought between 2016-01-01 and 2016-05-01 for Platinum each day?**

* `/stats`
	* GET `/stats/pricelist` - Gives you a big HashMap-like JSON object that contains price data for all articles for easy lookup
	* GET `/stats/mostsold` - Gives you a list of the most sold articles for a timespan

* `/articles…`
	* POST `/articles/search` - Let's you search for (known**) articles there are official AH sales for
	* GET `/articles` - Gives you a list of all (known**) articles there are official AH sales for
	* GET `/articles/:name` - Gives you details for a specific article (currently it's name, game uuid, rarity, type (cards, equipment, packs, …) and set it belongs to)
	* GET `/articles/:name/histories` - This is similiar to `/histories`, but additionally gives you median values instead of just average price values
	* GET `/articles/:name/summaries` - This is also similiar to `/summaries`; Also includes median price values instead of just average price values like `/summaries` does

* GET `/sets` - Gives you a list of all (known**) sets of sold articles


** Additional article info like it's set or uuid is fetched from mining game files. This usually means that for all sold articles in the auction house there is data around, but it could be missing at one point in the future, which means that additional information (like the set of a card) is missing and therefore special API requests that for example query a summary of all legendary cards of a specific set might yield incorrect data.

## Articles

All types within the world of HEX (eg. cards, equipment, packs, etc.), are represented by `articles` in this API.

GET [`/v1/articles`](/v1/articles)

Returns an array of all articles.

Optional Parameters:

- `limit` - Integer - Limits the quantity of returned results (default: 25).
- `offset` - Integer - Skips `offset` articles before returning (default: 0).

--------------------------------------------------------------------------------

GET `/v1/articles/:name`

Returns all data for the article with name `:name`. If there is none, a `404` response is returned.

Example: [`/v1/articles/Vampire King`](/v1/articles/Vampire King)

```
{
  "name": "Wrathwood Colossus AA",   // extended name (if you request the AA version of a card, it's name is extended by " AA"; theoretically, once extended art versions are distinguished in HexEnt's data dumps, an extended and alternate art version of Wrathwood Colossus would be called "Wrathwood Colossus EAA")
  "type": "Card",   // type of the article, eg. "Card", "Pack" or "Other",
  "rarity": "Epic", // rarity of the article; might be null
}
```

--------------------------------------------------------------------------------

GET `/v1/articles/:name/summaries`

Returns a JSON object containing summarizing sales for the specified article `:name` for a specified timespan for each currency. If there is no article `:name`, a `404` response is returned.

Optional Parameters:

- `start` - String - A valid date representation, such as "2016-01-01" (default: the date for the time of the request in CET timezone - 31 days)
- `end` - String - same as above (default: the date of the time of the request in CET timezone)

Example 1: [`/v1/articles/Wrathwood Colossus/summaries`](/v1/articles/Wrathwood Colossus/summaries): Last months data

```
{
  "platinum": {
    "currency": "Platinum",
    "avg": 81,
    "median": 50,
    "min": 30,
    "max": 215,
    "total": 1697,
    "quantity": 21
  },
  "gold": {
    "currency": "Gold",
    "avg": 7690,
    "median": 7500,
    "min": 2,
    "max": 14900,
    "total": 76904,
    "quantity": 10
  }
}
```

Example 2: [`/v1/articles/Wrathwood Colossus/summaries?start=2014-12-23&end=2016-04-23`](/v1/articles/Wrathwood Colossus/summaries?start=2014-12-23&end=2016-04-23):

```
{
  "platinum": {
    "currency": "Platinum",
    "avg": 63,
    "median": 54,
    "min": 30,
    "max": 320,
    "total": 67196,
    "quantity": 1071
  },
  "gold": {
    "currency": "Gold",
    "avg": 7975,
    "median": 7375,
    "min": 2,
    "max": 111111,
    "total": 2591730,
    "quantity": 325
  }
}
```

--------------------------------------------------------------------------------

GET `/v1/articles/:name/histories`

Returns a JSON object with daily summary data for each currency for the article `:name`. If the article `:name` does not exist, a `404` response is returned.

Optional Parameters:

- `start` - String - A valid date representation, such as "2016-01-01" (default: the date for the time of the request in CET timezone - 3 months)
- `end` - String - same as above (default: the date of the time of the request in CET timezone)

Example: [`/v1/articles/Wrathwood Colossus/histories`](/v1/articles/Wrathwood Colossus/histories) (excerpt)

```
{
  "platinum": [
    {
      "d": "2016-01-24T00:00:00.000Z", // date
      "c": "Platinum",                 // currency
      "a": 48,                         // average price for that day
      "m": 49,                         // median price for that day
      "mi": 40,                        // minimum price for that day
      "ma": 60,                        // maximum price for that day
      "t": 339,                        // total currency spent that day
      "q": 7                           // total quantity of units sold that day
    },
    {
      "d": "2016-01-25T00:00:00.000Z",
      "c": "Platinum",
      "a": 50,
      "m": 50,
      "mi": 49,
      "ma": 50,
      "t": 99,
      "q": 2
    }, ...
  ],
  "gold": [...]
}
```

--------------------------------------------------------------------------------

POST `/v1/articles/search`

Let's you search for all articles with certain attribute values.

Optional Parameters:

- `name` - String - The name of the searched article.
- `uuid` - String - The official game uuid of the searched article.
- `rarity` - String - The rarity of the searched articles.
- `type` - String - The type of the searched articles.
- `set` - String - The set of the searched articles. Check `/v1/sets` for a list of all values.
- `limit` - Integer - Limits the quantity of returned results (default: 25).
- `offset` - Integer - Skips `offset` articles before returning (default: 0).
- `contains` - Boolean - If true, all articles with a name containing `name` will be searched (case insensitive), instead of exact matches (case sensitive)

Example: POST `/v1/articles/search` with request body "{rarity: 'Epic'}"

```
[
  {
    "name": "Adamanthian Scrivener AA",
    "type": "Card",
    "rarity": "Epic"
  },
  {
    "name": "Arborean Rootfather AA",
    "type": "Card",
    "rarity": "Epic"
  }, ...
]
```

--------------------------------------------------------------------------------

## Sets

GET [`/v1/sets`](/v1/sets)

Returns an array of all set string values.

Example: 

```
[
  "Armies of Myth",
  "None Defined",
  "Primal Dawn",
  "PvE 01 Universal Card Set",
  "PvE02 Universal Card Set",
  "Set01 Kickstarter",
  "Set01 PvE Arena",
  "Set01 PvE Holiday",
  "Set03 PvE Promo",
  "Set04 PvE Promo",
  "Shards of Fate",
  "Shattered Destiny",
  "UNSET"
]
```

--------------------------------------------------------------------------------

## Histories

GET `/v1/histories`

Unlike `/articles/:name/histories`, this endpoint lets you find historical data for more than one article.
However, due to how I aggregate my data, this endpoint does not return any median price values.

Optional Parameters:

- `start` - String - Starting date of the timespan you want a history for (default: NOW() - 3 months)
- `end` - String - Ending date of the timespan you want a history for (default: NOW())
- `name` - String - The name of the searched article.
- `uuid` - String - The official game uuid of the searched article.
- `rarity` - String - The rarity of the searched articles.
- `type` - String - The type of the searched articles.
- `set` - String - The set of the searched articles. Check `/v1/sets` for a list of all values.
- `currency` - String - The currency to filter upon.

Example: GET [`/v1/histories?start=2016-08-03&end=2016-08-06&rarity=Legendary&type=Card&set=Shards of Fate`](/v1/histories?start=2016-08-03&end=2016-08-06&rarity=Legendary&type=Card&set=Shards of Fate)

This returns a history of all sales for legendary cards of Shards of Fate per currency between 2016-08-03 and 2016-08-06.

	{
	  "platinum": [
	    {
	      "d": "2016-08-02T22:00:00.000Z", // actually 2016-08-03 but with timezone information
	      "t": 56461, // total platinum spent that day on legendary cards from Shards of Fate that day
	      "q": 53 // total quantity of legendary cards from Shards of Fate sold that day
	    },
	    {
	      "d": "2016-08-03T22:00:00.000Z",
	      "t": 20929,
	      "q": 20
	    },
	    {
	      "d": "2016-08-04T22:00:00.000Z",
	      "t": 16457,
	      "q": 24
	    },
	    {
	      "d": "2016-08-05T22:00:00.000Z",
	      "t": 33750,
	      "q": 36
	    }
	  ],
	  "gold": [
	    {
	      "d": "2016-08-02T22:00:00.000Z",
	      "t": 49500,
	      "q": 2
	    },
	    {
	      "d": "2016-08-03T22:00:00.000Z",
	      "t": 59333,
	      "q": 2
	    }
	  ]
	}

--------------------------------------------------------------------------------

## Summaries

GET `/v1/summaries`

Unlike `/articles/:name/summaries`, this endpoint lets you find summarizing data for more than one article.
However, due to how I aggregate my data, this endpoint does not return any median price values.

Optional Parameters:

- `start` - String - Starting date of the timespan you want a history for (default: NOW() - 3 months)
- `end` - String - Ending date of the timespan you want a history for (default: NOW())
- `name` - String - The name of the searched article.
- `uuid` - String - The official game uuid of the searched article.
- `rarity` - String - The rarity of the searched articles.
- `type` - String - The type of the searched articles.
- `set` - String - The set of the searched articles. Check `/v1/sets` for a list of all values.
- `currency` - String - The currency to filter upon.

Example: GET [`/v1/summaries?start=2016-08-03&end=2016-08-06&rarity=Legendary&type=Card&set=Shards of Fate`](/v1/summaries?start=2016-08-03&end=2016-08-06&rarity=Legendary&type=Card&set=Shards of Fate)

This summarizes all sales for legendary cards of Shards of Fate per currency between 2016-08-03 and 2016-08-06.

	{
	  "platinum": {
	    "total": 127597,
	    "quantity": 133,
	    "average": 959,
	    "min": 50,
	    "max": 4500
	  },
	  "gold": {
	    "total": 108833,
	    "quantity": 4,
	    "average": 27208,
	    "min": 9500,
	    "max": 40000
	  }
	}

--------------------------------------------------------------------------------

## Stats

Under `/stats` I'll collect some different endpoints that don't fit the rest.

GET `/v1/stats/pricelist`

Returns a collection of summary data for each article for each currency. Basically it is like `/v1/articles/:name/summaries` but for all articles and for different timespans at once. Ideally you want to use this to calculate prices of decks/collections of articles.

Example: [`/v1/stats/pricelist`](/v1/stats/pricelist) (excerpt)

```
{
  "gold": {...},
  "platinum": {
    "Vampire King": {
      "3": {          // data for last 3 days
        "q": 17,      // quantity sold
        "t": 69194,   // total currency spent
        "mi": 3200,   // minimum price for the last 3 days
        "ma": 4695,   // maximum price for the last 3 days
        "a": 4070     // average price for the last 3 days
      },
      "7": {          // data for last 7 days
        "q": 45,
        "t": 174190,
        "mi": 3016,
        "ma": 4695,
        "a": 3870
      },
      "14": {          // data for last 14 days
        "q": 81,
        "t": 299856,
        "mi": 3016,
        "ma": 4695,
        "a": 3701
      }
    }, ...
  }
}
```

--------------------------------------------------------------------------------

GET `/v1/stats/mostsold`

Returns a list of most sold articles based on the specified parameters per currency.

Optional Parameters:

- `start` - String - The start of the timespan to aggregate on (default: today - days)
- `end` - String - The end of the timespan to aggregate on (default: today)
- `limit` - Integer - The number of articles with most sales to return (default: 30)

Example: [`/v1/stats/mostsold?limit=5&start=2016-05-05&end=2016-05-10`](/v1/stats/mostsold?limit=5&start=2016-05-05&end=2016-05-10) gives you the **five** most sold articles per currency of between 2016-05-05 and 2016-05-10:

	{
	  "platinum": [
	    {
	      "name": "Set 004 Booster Pack",
	      "quantity": 2190,
	      "total": 399256,
	      "avg": 182
	    },
	    {
	      "name": "Set 003 Booster Pack",
	      "quantity": 901,
	      "total": 164306,
	      "avg": 182
	    },
	    {
	      "name": "Rare Stardust",
	      "quantity": 764,
	      "total": 4995,
	      "avg": 6
	    },
	    {
	      "name": "Common Stardust",
	      "quantity": 742,
	      "total": 1870,
	      "avg": 2
	    },
	    {
	      "name": "Uncommon Stardust",
	      "quantity": 650,
	      "total": 1573,
	      "avg": 2
	    }
	  ],
	  "gold": [...]
	}
