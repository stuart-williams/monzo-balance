const symbol = require('currency-symbol-map')

exports.formatAmount = (currency, amount) =>
  `${(symbol(currency) || '')}${(Math.abs(amount) / 100).toFixed(2)}`
