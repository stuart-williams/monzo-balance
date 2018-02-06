/* eslint camelcase: 0 */

require('dotenv').config()

const express = require('express')
const session = require('express-session')
const { requestAccessToken, requestRefreshToken } = require('./auth')
const fetchBalance = require('./fetch-balance')

const app = express()

app.set('view engine', 'pug')
app.use(express.static('public'))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: 'monzo-balance'
}))

app.get('/', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }

  try {
    res.render('index', await fetchBalance(req))
  } catch (error) {
    try {
      if (error.code === 401) {
        req.session.user = await requestRefreshToken(req.session.user)
        res.render('index', await fetchBalance(req))
      } else {
        throw new Error(error)
      }
    } catch (error) {
      res.redirect('/error')
    }
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
    res.redirect('/error')
  }
})

app.get('/error', (req, res) => res.render('error'))

module.exports = app
