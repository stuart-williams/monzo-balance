/* eslint camelcase: 0 */

const request = require('request')

const post = ({ form }) => new Promise((resolve, reject) =>
  request.post('https://api.monzo.com/oauth2/token', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: Object.assign({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    }, form)
  },
  (error, response, body) => error || response.statusCode !== 200
    ? reject(error)
    : resolve(JSON.parse(body))))

exports.requestAccessToken = ({ code }) => post({
  form: {
    grant_type: 'authorization_code',
    redirect_uri: process.env.REDIRECT_URI,
    code
  }
})

exports.requestRefreshToken = ({ refresh_token }) => post({
  form: {
    grant_type: 'refresh_token',
    refresh_token
  }
})
