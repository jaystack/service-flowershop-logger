const { transports } = require('winston')

module.exports = {

  logger: {
    transportFactories: []
  },

  messaging: {
    requestQueue: 'service-flowershop-logger-test-requests',
    deadLetterExchange: 'service-flowershop-logger-test-dlx',
    deadLetterQueue: 'service-flowershop-logger-dlq'
  }

}