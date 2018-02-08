require('dotenv').config()

const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const logger = require('./common/logger')

const app = express()

app.set('view engine', 'pug')

app.use(express.static('public'))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.NODE_ENV === 'production'
  }
}))

app.use(require('./middleware/cache-headers'))
app.use(morgan('combined', { stream: logger.stream }))
app.use(require('./router'))

module.exports = app
