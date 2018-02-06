/* eslint-env mocha, chai */

const express = require('express')
const request = require('supertest')
const { expect } = require('chai')
const nock = require('nock')
const cheerio = require('cheerio')
const app = require('../src/app')

function stubAppWithSession (session) {
  const parentApp = express()
  parentApp.use((req, res, next) => {
    req.session = session
    next()
  })
  parentApp.use(app)
  return parentApp
}

describe('Home route', () => {
  it('should redirect a non authenticated user to the login page', (done) => {
    const stubApp = stubAppWithSession()

    request(stubApp)
      .get('/')
      .expect(302)
      .expect('Location', '/login')
      .end(done)
  })

  it('should correctly render the home view when the access_token is valid', (done) => {
    nock('https://api.monzo.com')
      .get('/accounts')
      .reply(200, {
        accounts: [{
          id: '1',
          type: 'uk_prepaid'
        }, {
          id: '2',
          type: 'uk_retail'
        }]
      })
      .get('/balance?account_id=2').reply(200, {
        currency: 'GBP',
        balance: '10000',
        total_balance: '20000'
      })

    const stubApp = stubAppWithSession({
      user: {
        access_token: 'valid_access_token'
      }
    })

    request(stubApp)
      .get('/')
      .expect(200)
      .expect((res) => {
        const $ = cheerio.load(res.text)
        const $balance = $('#balance').text()
        const $totalBalance = $('#total-balance').text()

        expect($balance).to.equal('£100.00')
        expect($totalBalance).to.equal('£200.00')
      })
      .end(done)
  })
})
