const router = require('express').Router()
const logger = require('./common/logger')
const { requestAccessToken, requestRefreshToken } = require('./common/auth')
const fetchBalance = require('./common/fetch-balance')

const homeRoute = async (req, res) => {
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
      req.session.user = undefined
      res.redirect('/error')
    }
  }
}

const authRedirectRoute = async (req, res) => {
  try {
    req.session.user = await requestAccessToken(req.query)
    res.redirect('/')
  } catch (error) {
    logger.error(error)
    req.session.user = undefined
    res.redirect('/error')
  }
}

const loginRoute = (data) => (req, res) => {
  if (req.session.user) return res.redirect('/')

  res.render('login', Object.assign({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    state: process.env.STATE_SECRET,
    response_type: 'code'
  }, data))
}

router.get('/', homeRoute)
router.get('/auth-redirect', authRedirectRoute)
router.get('/login', loginRoute({ message: 'Welcome to Monzo Balance!' }))
router.get('/error', loginRoute({ message: 'Oops, something went wrong' }))

module.exports = router
