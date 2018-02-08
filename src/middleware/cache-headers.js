module.exports = (req, res, next) => {
  if (req.session.user) {
    res.set('Cache-Control', 'no-cache')
  }
  next()
}
