# hexsales-api

A REST-like HTTP API for sales data for the HEX tcg built with node.js and koa.js

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
in `lib/updater` there is a file called `index.js` which deals with all of this. If you start it with `node
lib/updater/index.js` it starts downloading and inserting all auction house dumps into the specified database.

## Usage
`npm start` starts the server on port 3000.
