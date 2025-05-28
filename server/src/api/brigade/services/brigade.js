'use strict';

/**
 * brigade service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::brigade.brigade');
