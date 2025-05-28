'use strict';

/**
 * brigade controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::brigade.brigade');
