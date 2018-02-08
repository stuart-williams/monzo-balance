require('dotenv').config()

const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const logger = require('./logger')

const app = express()

app.set('view engine', 'pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    domain: '*.monzobalance.co.uk',
    secure: process.env.NODE_ENV === 'production'
  }
}))
app.use(express.static('public'))
app.use(morgan('combined', { stream: logger.stream }))
app.use(require('./router'))

module.exports = app
