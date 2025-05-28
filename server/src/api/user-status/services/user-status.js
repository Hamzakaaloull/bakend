'use strict';

/**
 * user-status service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-status.user-status');
