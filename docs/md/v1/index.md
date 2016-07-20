# v1 documentation

## Changelog

### 2016-07-20
* Added `/stats/pricelist` resource - list of summary data (avg/min/max price, sold quantity) over different timespans for all articles at once

---

## Articles
All types within the world of HEX (eg. cards, equipment, packs, etc.), are represented by `articles` in this API.

GET <a href="/v1/articles">`/v1/articles`</a>

Returns an array of all articles.

Optional Parameters:

* `limit` - Integer - Limits the quantity of returned results (default: 25).
* `offset` - Integer - Skips `offset` articles before returning (default: 0).

---

GET `/v1/articles/:name`

Returns all data for the article with name `:name`. If there is none, a `404` response is returned.

Example: <a href="/v1/articles/Vampire King">`/v1/articles/Vampire King`</a>

    {
      "name": "Wrathwood Colossus AA",   // extended name (if you request the AA version of a card, it's name is extended by " AA"; theoretically, once extended art versions are distinguished in HexEnt's data dumps, an extended and alternate art version of Wrathwood Colossus would be called "Wrathwood Colossus EAA")
      "type": "Card",   // type of the article, eg. "Card", "Pack" or "Other",
      "rarity": "Epic", // rarity of the article; might be null
    }

---

GET `/v1/articles/:name/summaries`

Returns a JSON object containing summarizing sales for the specified article `:name` for a specified timespan for each currency. If there is no article `:name`, a `404` response is returned.

Optional Parameters:

* `start` - String - A valid date representation, such as "2016-01-01" (default: the date for the time of the request in CET timezone - 31 days)
* `end` - String - same as above (default: the date of the time of the request in CET timezone)

Example 1: <a href="/v1/articles/Wrathwood Colossus/summaries">`/v1/articles/Wrathwood Colossus/summaries`</a>: Last months data

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

Example 2: <a href="/v1/articles/Wrathwood Colossus/summaries?start=2014-12-23&end=2016-04-23">`/v1/articles/Wrathwood Colossus/summaries?start=2014-12-23&end=2016-04-23`</a>:

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

---

GET `/v1/articles/:name/histories`

Returns a JSON object with daily summary data for each currency for the article `:name`. If the article `:name` does not exist, a `404` response is returned.

Optional Parameters:

* `start` - String - A valid date representation, such as "2016-01-01" (default: the date for the time of the request in CET timezone - 3 months)
* `end` - String - same as above (default: the date of the time of the request in CET timezone)

Example: <a href="/v1/articles/Wrathwood Colossus/histories">`/v1/articles/Wrathwood Colossus/histories`</a> (excerpt)

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

---

POST `/v1/articles/search`

Let's you search for all articles with certain attribute values.

Optional Parameters:

* `name` - String - The name of the searched article.
* `rarity` - String - The rarity of the searched articles.
* `type` - String - The type of the searched articles.
* `limit` - Integer - Limits the quantity of returned results (default: 25).
* `offset` - Integer - Skips `offset` articles before returning (default: 0).
* `contains` - Boolean - If true, all articles with a name containing `name` will be searched (case insensitive), instead of exact matches (case sensitive)

Example: POST `/v1/articles/search` with request body "{rarity: 'Epic'}"

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


## Economy
Under this I'd like to group all data that isn't specific to a certain article.

---

GET `/v1/economy/histories`

Returns a JSON object with daily summary data for each currency for all sales in the specified timeframe.

Optional Parameters:

* `start` - String - A valid date representation, such as "2016-01-01" (default: the date for the time of the request in CET timezone - 3 months)
* `end` - String - same as above (default: the date of the time of the request in CET timezone)

Example: <a href="/v1/economy/histories">`/v1/economy/histories`</a>

Looks exactly the same as `/v1/articles/:name/histories`

---

GET `/v1/economy/mostsold`

Returns a list of most sold articles based on the specified parameters per currency.

Optional Parameters:

* `start` - String - The start of the timespan to aggregate on (default: today - days)
* `end` - String - The end of the timespan to aggregate on (default: today)
* `limit` - Integer - The number of articles with most sales to return (default: 30)

Example: So <a href="/v1/economy/mostsold?limit5">`/v1/economy/mostsold?limit=5`</a> gives you the **five** most sold articles per currency of the last 3 days. For 2016-05-05:

	{
	    "platinum": [{
	        "name": "Set 003 Booster Pack",
	        "quantity": 5246,
	        "total": 766272,
	        "avg": 146
	    }, {
	        "name": "Common Stardust",
	        "quantity": 1834,
	        "total": 4623,
	        "avg": 2
	    }, {
	        "name": "Uncommon Stardust",
	        "quantity": 1591,
	        "total": 5201,
	        "avg": 3
	    }, {
	        "name": "Set 001 Booster Pack",
	        "quantity": 1152,
	        "total": 197393,
	        "avg": 171
	    }, {
	        "name": "Rare Stardust",
	        "quantity": 1073,
	        "total": 17893,
	        "avg": 16
	    }],
	    "gold": [...]
	}

---

## Stats
Under `/stats` I'll collect some different endpoints that don't fit the rest.

GET `/v1/stats/pricelist`

Returns a collection of summary data for each article for each currency. Basically it is like `/v1/articles/:name/summaries` but for all articles and for different timespans at once.
Ideally you want to use this to calculate prices of decks/collections of articles.

Example: `/v1/stats/pricelist` (excerpt)

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
