'use strict';

/**
 * @file Exports a configuration object specific to environment 'staging'
 */

if (!process.env.PORT)  {
    throw new Error('process.env.PORT not provided');
}
if (!process.env.CONNECTIONSTRING)  {
    throw new Error('process.env.CONNECTIONSTRING not provided');
}

module.exports = {

    environment: 'staging',

    port: process.env.PORT,
    connectionstring: process.env.CONNECTINSTRING

};
