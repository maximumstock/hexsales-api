'use strict';

/**
 * @file Entry file that starts the server
 */

const app = require('./lib');
const config = require('./config');

app.listen(config.port);
console.info(`Server is running at ${config.port}`);
