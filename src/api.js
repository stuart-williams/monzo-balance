/* eslint camelcase: 0 */

const request = require('request')
const curry = require('curry')

const fetch = curry((path, req) => new Promise((resolve, reject) =>
  request.get(`https://api.monzo.com/${path}`, {
    headers: {
      Authorization: `Bearer ${req.session.user.access_token}`
    }
  },
  (error, response, body) => error || response.statusCode !== 200
    ? reject(error)
    : resolve(JSON.parse(body)))))

exports.fetchAccounts = fetch('accounts')
exports.fetchBalance = (id, req) => fetch('balance?account_id=' + id, req)
