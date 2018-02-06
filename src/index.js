/* eslint camelcase: 0 */

require('dotenv').config()

const express = require('express')
const session = require('express-session')
const { requestAccessToken } = require('./auth')
const { fetchAccounts, fetchBalance } = require('./api')
const { formatAmount } = require('./utils')

const app = express()
const port = process.env.PORT || 5000

app.set('view engine', 'pug')
app.use(express.static('public'))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: 'monzo-balance'
}))

app.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/login')

  try {
    const { accounts } = await fetchAccounts(req)
    const { id } = accounts.find(({ type }) => type === 'uk_retail') || accounts[0]
    const { currency, balance, total_balance } = await fetchBalance(id, req)

    res.render('index', {
      balance: formatAmount(currency, balance),
      total_balance: formatAmount(currency, total_balance)
    })
  } catch (error) {
    console.log(error)
    res.send('Oops, someting went wrong...')
  }
})

app.get('/login', (req, res) => res.render('login', {
  client_id: process.env.CLIENT_ID,
  redirect_uri: process.env.REDIRECT_URI,
  response_type: 'code',
  state: process.env.STATE_SECRET
}))

app.get('/auth-redirect', async (req, res) => {
  try {
    req.session.user = await requestAccessToken(req.query)
    res.redirect('/')
  } catch (error) {
    res.send('Oops, someting went wrong...')
  }
})

app.listen(port, () => console.log(`http://localhost:${port}`))
