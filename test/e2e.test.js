/* eslint-env mocha, chai */

const express = require('express')
const request = require('supertest')
const { expect } = require('chai')
const nock = require('nock')
const cheerio = require('cheerio')
const app = require('../src/app')
const { reqHeaders, accountsResponse, balanceResponse } = require('./data.json')

function createStubApp (session) {
  const parentApp = express()
  parentApp.use((req, res, next) => {
    req.session = session
    next()
  })
  parentApp.use(app)
  return parentApp
}

function isValidHomeView (res) {
  const $ = cheerio.load(res.text)
  expect($('#balance').text()).to.equal('Your balance is £100.00')
}

describe('Home route', () => {
  it('should redirect a non authenticated user to the login page', (done) => {
    const stubApp = createStubApp()

    request(stubApp)
      .get('/')
      .expect(302)
      .expect('Location', '/login')
      .end(done)
  })

  it('should correctly render the home view when the access_token is valid', (done) => {
    const stubApp = createStubApp({
      user: {
        access_token: 'valid_access_token'
      }
    })

    nock('https://api.monzo.com', reqHeaders.valid)
      .get('/accounts')
      .reply(200, accountsResponse)
      .get('/balance?account_id=2')
      .reply(200, balanceResponse)

    request(stubApp)
      .get('/')
      .expect(200)
      .expect('Cache-Control', 'no-cache')
      .expect(isValidHomeView)
      .end(done)
  })

  it('should request a refresh token when the access_token is invalid', (done) => {
    const stubApp = createStubApp({
      user: {
        access_token: 'invalid_access_token',
        refresh_token: 'valid_refresh_token'
      }
    })

    nock('https://api.monzo.com', reqHeaders.invalid)
      .get('/accounts')
      .reply(401)

    nock('https://api.monzo.com')
      .post('/oauth2/token', {
        client_id: /.*/,
        client_secret: /.*/,
        grant_type: 'refresh_token',
        refresh_token: 'valid_refresh_token'
      })
      .reply(200, {
        access_token: 'valid_access_token'
      })

    nock('https://api.monzo.com', reqHeaders.valid)
      .get('/accounts')
      .reply(200, accountsResponse)
      .get('/balance?account_id=2')
      .reply(200, balanceResponse)

    request(stubApp)
      .get('/')
      .expect(200)
      .expect('Cache-Control', 'no-cache')
      .expect(isValidHomeView)
      .end(done)
  })

  it('should redirect to the error page when the api responds with a non 200/401 status code', (done) => {
    const stubApp = createStubApp({
      user: {
        access_token: 'valid_access_token'
      }
    })

    nock('https://api.monzo.com', reqHeaders.valid)
      .get('/accounts')
      .reply(500)

    request(stubApp)
      .get('/')
      .expect(302)
      .expect('Location', '/error')
      .end(done)
  })
})

describe('Auth redirect route', () => {
  it('should redirect to the home route when successfully authenticated', (done) => {
    const stubApp = createStubApp()

    nock('https://api.monzo.com')
      .post('/oauth2/token', {
        client_id: /.*/,
        client_secret: /.*/,
        grant_type: 'authorization_code',
        redirect_uri: /.*/
      })
      .reply(200, {
        access_token: 'valid_access_token'
      })

    request(stubApp)
      .get('/auth-redirect')
      .expect(302)
      .expect('Location', '/')
      .end(done)
  })

  it('should redirect to the error page when the api responds with a non 200 status code', (done) => {
    const stubApp = createStubApp({
      user: {
        access_token: 'valid_access_token'
      }
    })

    nock('https://api.monzo.com')
      .post('/oauth2/token', {
        client_id: /.*/,
        client_secret: /.*/,
        grant_type: 'authorization_code',
        redirect_uri: /.*/
      })
      .reply(500)

    request(stubApp)
      .get('/auth-redirect')
      .expect(302)
      .expect('Location', '/error')
      .end(done)
  })
})

describe('Login route', () => {
  it('should redirect to the home route if the user is authenticated', (done) => {
    const stubApp = createStubApp({
      user: {
        access_token: 'valid_access_token'
      }
    })

    request(stubApp)
      .get('/login')
      .expect(302)
      .expect('Location', '/')
      .end(done)
  })
})
