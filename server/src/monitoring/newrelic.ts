require('newrelic');

export const newrelicConfig = {
  app_name: ['REMag'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
    enabled: true,
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  transaction_events: {
    attributes: {
      exclude: [
        'request.headers.authorization',
        'request.parameters.password'
      ]
    }
  }
};
