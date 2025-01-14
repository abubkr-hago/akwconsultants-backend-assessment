const packageJson = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: `${packageJson.name} API documentation`,
    version: packageJson.version,
    license: {
      name: packageJson.license,
      url: packageJson.repository.url,
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
