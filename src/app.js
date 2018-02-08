/* eslint camelcase: 0 */

require('dotenv').config()

const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const logger = require('./logger')
const { requestAccessToken, requestRefreshToken } = require('./auth')
const fetchBalance = require('./fetch-balance')

const app = express()

const loginForm = {
  client_id: process.env.CLIENT_ID,
  redirect_uri: process.env.REDIRECT_URI,
  state: process.env.STATE_SECRET,
  response_type: 'code'
}

app.set('view engine', 'pug')
app.use(express.static('public'))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    domain: '*.monzobalance.co.uk',
    secure: process.env.NODE_ENV === 'production'
  }
}))

app.use(morgan('combined', { stream: logger.stream }))

app.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/login')

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
      logger.error(error)
      res.redirect('/error')
    }
  }
})

app.get('/auth-redirect', async (req, res) => {
  try {
    req.session.user = await requestAccessToken(req.query)
    res.redirect('/')
  } catch (error) {
    logger.error(error)
    res.redirect('/error')
  }
})

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/')

  res.render('login', Object.assign({
    message: 'Welcome to Monzo Balance!'
  }, loginForm))
})

app.get('/error', (req, res) => {
  if (req.session.user) return res.redirect('/')

  res.render('login', Object.assign({
    message: 'Oops, something went wrong'
  }, loginForm))
})

module.exports = app
