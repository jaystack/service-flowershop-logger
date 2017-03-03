const { transports } = require('corpjs-logger')

module.exports = {

  endpoints: {
    endpointsFilePath: 'system-endpoints.json'
  },

  logger: {
    transportFactories: [
      () => new transports.Console({
        level: "debug",
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: true
      }),
      () => new transports.File({
        level: "info",
        filename: "all-logs.log",
        fullFilePath: "",
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false,
        timestamp: true
      })
    ]
  },

  rabbit: {
    connection: {
      username: 'guest',
      password: 'guest'
    }
  },

  messaging: {
    requestQueue: 'loggerMQ',
    deadLetterExchange: 'service-flowershop-logger-dlx'
  }

}