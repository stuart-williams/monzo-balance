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
    const balance = await fetchBalance(req)
    res.render('index', balance)
  } catch (error) {
    try {
      if (error.code === 401) {
        req.session.user = await requestRefreshToken(req.session.user)
        res.redirect('/')
      } else {
        throw new Error(error)
      }
    } catch (error) {
      console.log(error)
      res.send('Oops, someting went wrong...')
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
    res.send('Oops, someting went wrong...')
  }
})

module.exports = app