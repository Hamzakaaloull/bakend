'use strict';

/**
 * info-app service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::info-app.info-app');
