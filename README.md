# hexsales-api

*NOTE: The [HEX TCG](https://en.wikipedia.org/wiki/Hex:_Shards_of_Fate) was shut down, so is this project.*

---

A REST-like HTTP API for sales data for the HEX tcg built with node.js and koa.js

- [API documentation](DOCS.md)
- [Changelogs](CHANGELOG.md)

## Installation
`npm install`

## Configuration
All configuration settings are accessible under `config/index.js`.
Configurable settings are:

* Port to run on
* Database connection details

## Database migration
I use [knex.js](http://knexjs.org) for managing migrations, so you can run `knex migrate:latest` to migrate to the
latest version and `knex migrate:rollback` to roll-back the last migration.

## How to get the data
`npm run update` starts downloading and inserting all auction house dumps into the specified database.

## Usage
`npm start` starts the server on port 3000.
