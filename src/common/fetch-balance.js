/* eslint camelcase: 0, prefer-promise-reject-errors: 0 */

const request = require('request')
const symbol = require('currency-symbol-map')

const formatAmount = (currency, amount) =>
  `${(symbol(currency) || '')}${(Math.abs(amount) / 100).toFixed(2)}`

const fetch = (path, req) => new Promise((resolve, reject) =>
  request.get(`https://api.monzo.com/${path}`, {
    headers: {
      Authorization: `Bearer ${req.session.user.access_token}`
    }
  },
  (error, res, body) => error || res.statusCode !== 200
    ? reject({ code: res.statusCode, error })
    : resolve(JSON.parse(body))))

module.exports = async (req) => {
  const { accounts } = await fetch('accounts', req)
  const { id } = accounts.find(({ type }) => type === 'uk_retail') || accounts[0]
  const { currency, balance } = await fetch('balance?account_id=' + id, req)

  return {
    balance: formatAmount(currency, balance)
  }
}
