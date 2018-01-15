# Changelog

#### 2016-09-28
* `/stats/pricelist` now contains more data. Instead of aggregate data of the last 3, 7 and 14 days there is now data
  for the last 1, 2, 3, 6, 7, 8, 13, 14, 15 days

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
