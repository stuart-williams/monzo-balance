const winston = require('winston')

const transports = []

if (process.env.LOG_PATH) {
  transports.push(new winston.transports.File({
    filename: `${process.env.LOG_PATH}/output.log`
  }))
} else {
  transports.push(new winston.transports.Console({
    colorize: true
  }))
}

const logger = new winston.Logger({ transports })

module.exports = logger
module.exports.stream = {
  write (message, encoding) {
    logger.info(message)
  }
}
