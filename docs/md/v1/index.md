# v1 documentation

## Changelog

#### 2016-09-08

* All article specific endpoints now use the UUID property for referencing articles instead of their name property. For example, sending a GET request to `/v1/articles/Vampire King` is now invalid and should use the UUID like so: `/v1/articles/46c02066-29af-4b7d-bbcb-41ba76e8120f`. This breaks a lot of old code, but needed to be changed because of naming policies of HEX.
* `/stats/pricelist` now uses uuids as article keys for it's hashmap-like JSON object

#### 2016-08-14

- Unified return data formats for Summaries and Histories:
- Properties of summaries are non-shortened throughout the api (eg. `average` instead of `avg`, `minimum` instead of `min`, etc.)
- Properties of everything else (histories, pricelists) are always shortened to save bandwith (eg. `a` instead of `average`, `mi` instead of `minimum`)
- To properly identify articles, their UUIDs are needed, since now names are used for more than just one type of
article (eg. 'The Kraken' as champion and card). Since UUIDs are included in the AH files starting from 2016-07-08,
all previous data has been dropped.

#### 2016-08-06

- Moved `/economy/mostsold` to `/stats/mostsold`
- Removed `/economy` endpoint
- Added `/histories` endpoint
- Added `/summaries` endpoint

#### 2016-07-20

- Added `/stats/pricelist` resource - list of summary data (avg/min/max price, sold quantity) over different timespans for all articles at once

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
	* GET `/articles/:uuid` - Gives you details for a specific article (currently it's name, game uuid, rarity, type (cards, equipment, packs, …) and set it belongs to)
	* GET `/articles/:uuid/histories` - This is similiar to `/histories`, but additionally gives you median values instead of just average price values
	* GET `/articles/:uuid/summaries` - This is also similiar to `/summaries`; Also includes median price values instead of just average price values like `/summaries` does

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

GET `/v1/articles/:uuid`

Returns all data for the article with uuid `:uuid`. If there is none, a `404` response is returned.

Example for `Wrathwood Colossus AA`: [`/v1/articles/054ddfcc-61f1-49d1-8287-37fb35a0c03d`](/v1/articles/054ddfcc-61f1-49d1-8287-37fb35a0c03d)

```
{
  "name": "Wrathwood Colossus AA",   // extended name (if you request the AA version of a card, it's name is extended by " AA"; theoretically, once extended art versions are distinguished in HexEnt's data dumps, an extended and alternate art version of Wrathwood Colossus would be called "Wrathwood Colossus EAA")
  "type": "Card",   // type of the article, eg. "Card", "Pack" or "Other",
  "rarity": "Epic", // rarity of the article; might be null
  ...
}
```

--------------------------------------------------------------------------------

GET `/v1/articles/:uuid/summaries`

Returns a JSON object containing summarizing sales for the specified article `:uuid` for a specified timespan for each currency. If there is no article `:uuid`, a `404` response is returned. Note that all properties (`average`, `median`, etc are written out, as opposed to the short form in history data).

Optional Parameters:

- `start` - String - A valid date representation, such as "2016-01-01" (default: the date for the time of the request in CET timezone - 31 days)
- `end` - String - same as above (default: the date of the time of the request in CET timezone)

Example 1 for `Wrathwood Colossus`: [`/v1/articles/b767da50-d694-4aeb-9197-e04be089befd/summaries`](/v1/articles/b767da50-d694-4aeb-9197-e04be089befd/summaries): Last months data

```
{
  "platinum": {
    "average": 81,
    "median": 50,
    "minimum": 30,
    "maximum": 215,
    "total": 1697,
    "quantity": 21
  },
  "gold": {
    "average": 7690,
    "median": 7500,
    "minimum": 2,
    "maximum": 14900,
    "total": 76904,
    "quantity": 10
  }
}
```

Example 2 for `Wrathwood Colossus`: [`/v1/articles/b767da50-d694-4aeb-9197-e04be089befd/summaries?start=2014-12-23&end=2016-04-23`](/v1/articles/b767da50-d694-4aeb-9197-e04be089befd/summaries?start=2014-12-23&end=2016-04-23):

```
{
  "platinum": {
    "average": 63,
    "median": 54,
    "minimum": 30,
    "maximum": 320,
    "total": 67196,
    "quantity": 1071
  },
  "gold": {
    "average": 7975,
    "median": 7375,
    "minimum": 2,
    "maximum": 111111,
    "total": 2591730,
    "quantity": 325
  }
}
```

--------------------------------------------------------------------------------

GET `/v1/articles/:uuid/histories`

Returns a JSON object with daily summary data for each currency for the article `:uuid`. If the article `:name` does not exist, a `404` response is returned. Note that all properties (`average`, `median`, etc are abbreviated, as opposed to the long form in summary data)

Optional Parameters:

- `start` - String - A valid date representation, such as "2016-01-01" (default: the date for the time of the request in CET timezone - 3 months)
- `end` - String - same as above (default: the date of the time of the request in CET timezone)

Example for `Wrathwood Colossus`: [`/v1/articles/b767da50-d694-4aeb-9197-e04be089befd/histories`](/v1/articles/b767da50-d694-4aeb-9197-e04be089befd/histories) (excerpt)

```
{
  "platinum": [
    {
      "d": "2016-01-24", 				// date
      "a": 48,                         // average price for that day
      "m": 49,                         // median price for that day
      "mi": 40,                        // minimum price for that day
      "ma": 60,                        // maximum price for that day
      "t": 339,                        // total currency spent that day
      "q": 7                           // total quantity of units sold that day
    },
    {
      "d": "2016-01-25T00:00:00.000Z",
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
- `contains` - Boolean - If true, all articles with a name containing `name` will be searched (case insensitive), instead of exact matches (case sensitive); defaults to `true`

Example: POST `/v1/articles/search` with request body "{rarity: 'Epic'}"

	[
		{
			"uuid": "d2222e6c-c8f8-4dad-b6d1-c0aacd3fc8f0",
			"name": "Adamanthian Scrivener AA",
			"aa": true,
			"set": "Shards of Fate",
			"rarity": "Epic",
			"type": "Card"
		},
		{
			"uuid": "9ef979ba-93c4-49dc-94a7-68be93806df4",
			"name": "Arborean Rootfather AA",
			"aa": true,
			"set": "Shattered Destiny",
			"rarity": "Epic",
			"type": "Card"
		},
		{
			"uuid": "d13064bf-bd0d-424c-8cdf-e5fa84db9855",
			"name": "Arcane Focus AA",
			"aa": true,
			"set": "Armies of Myth",
			"rarity": "Epic",
			"type": "Card"
		},
		{
			"uuid": "c46f187c-642a-4c68-a252-ee28a4d9e568",
			"name": "Ashwood Soloist AA",
			"aa": true,
			"set": "Armies of Myth",
			"rarity": "Epic",
			"type": "Card"
		},
		{
			"uuid": "bd6dd26c-4210-4935-b534-3c529223189e",
			"name": "Azurefate Sorceress AA",
			"aa": true,
			"set": "Shattered Destiny",
			"rarity": "Epic",
			"type": "Card"
		}, ...
	]

--------------------------------------------------------------------------------

## Sets

GET [`/v1/sets`](/v1/sets)

Returns an array of all set string values.

Example:

```
[
  "Armies of Myth",
  "Herofall",
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
]
```

--------------------------------------------------------------------------------

## Histories

GET `/v1/histories`

Unlike `/articles/:name/histories`, this endpoint lets you find historical data for more than one article.
However, due to how I aggregate my data, this endpoint does not return any median price values. Note that all properties (`average`, `median`, etc are abbreviated, as opposed to the long form in summary data)

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
				"d": "2016-08-03",
				"t": 55041,
				"q": 57,
				"a": 965,
				"mi": 51,
				"ma": 4500
			},
			{
				"d": "2016-08-04",
				"t": 22120,
				"q": 26,
				"a": 850,
				"mi": 51,
				"ma": 4000
			},
			{
				"d": "2016-08-05",
				"t": 17100,
				"q": 26,
				"a": 657,
				"mi": 60,
				"ma": 4200
			},
			{
				"d": "2016-08-06",
				"t": 35097,
				"q": 39,
				"a": 899,
				"mi": 50,
				"ma": 4440
			}
		],
		"gold": [
			{
				"d": "2016-08-03",
				"t": 49500,
				"q": 2,
				"a": 24750,
				"mi": 9500,
				"ma": 40000
			},
			{
				"d": "2016-08-04",
				"t": 59333,
				"q": 2,
				"a": 29666,
				"mi": 26000,
				"ma": 33333
			}
		]
	}

--------------------------------------------------------------------------------

## Summaries

GET `/v1/summaries`

Unlike `/articles/:uuid/summaries`, this endpoint lets you find summarizing data for more than one article.
However, due to how I aggregate my data, this endpoint does not return any median price values. Note that all properties (`average`, `median`, etc are written out, as opposed to the short form in history data)

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
			"total": 129358,
			"quantity": 148,
			"average": 874,
			"minimum": 50,
			"maximum": 4500
		},
		"gold": {
			"total": 108833,
			"quantity": 4,
			"average": 27208,
			"minimum": 9500,
			"maximum": 40000
		}
	}

--------------------------------------------------------------------------------

## Stats

Under `/stats` I'll collect some different endpoints that don't fit the rest.

GET `/v1/stats/pricelist`

Returns a collection of summary data for each article for each currency. Basically it is like `/v1/articles/:uuid/summaries` but for all articles and for different timespans at once. Ideally you want to use this to calculate prices of decks/collections of articles.

Example: [`/v1/stats/pricelist`](/v1/stats/pricelist) (excerpt)

```
{
  "gold": {...},
  "platinum": {
    "46c02066-29af-4b7d-bbcb-41ba76e8120f": { // UUID for Vampire King
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

Example: [`/v1/stats/mostsold?limit=5&start=2016-08-15&end=2016-08-20`](/v1/stats/mostsold?limit=5&start=2016-08-15&end=2016-08-20) gives you the **five** most sold articles per currency of between 2016-08-15 and 2016-08-20:

	{
		"platinum": [
			{
				"uuid": "a8e324e3-b9fb-4bb6-b659-f2773982aed2",
				"name": "Set 004 Booster Pack",
				"rarity": "", // Packs currently don't have a rarity
				"set": "Primal Dawn",
				"quantity": 638,
				"total": 118608,
				"average": 185
			},
			{
				"uuid": "ab4a63a8-c378-4693-8b5a-97e423d3d47b",
				"name": "Common Stardust",
				"rarity": "",
				"set": "UNSET",
				"quantity": 404,
				"total": 488,
				"average": 1
			},
			{
				"uuid": "a2a6129b-978a-40ce-9673-73588e6a40c3",
				"name": "Rare Stardust",
				"rarity": "", // Other items like Stardust also do not have a rarity value
				"set": "UNSET",
				"quantity": 338,
				"total": 1574,
				"average": 4
			},
			{
				"uuid": "8c665363-c8e3-4a6f-9ace-1b66f8669817",
				"name": "Convocation 2016",
				"rarity": "",
				"set": "None Defined",
				"quantity": 324,
				"total": 30927,
				"average": 95
			},
			{
				"uuid": "a8b78207-686a-4994-b6cd-4548d1349841",
				"name": "Set 001 Booster Pack",
				"rarity": "",
				"set": "Shards of Fate",
				"quantity": 275,
				"total": 46875,
				"average": 170
			}
		],
		"gold": [...]
	}
