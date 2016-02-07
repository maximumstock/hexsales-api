'use strict';

/**
 * @file Exports a configuration object specific to environment 'production'
 */

if (!process.env.PORT)  {
    throw new Error('process.env.PORT not provided');
}
if (!process.env.CONNECTIONSTRING)  {
    throw new Error('process.env.CONNECTIONSTRING not provided');
}

module.exports = {

    environment: 'production',

    port: process.env.PORT,
    connectionstring: process.env.CONNECTINSTRING

};
