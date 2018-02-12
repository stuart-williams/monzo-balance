module.exports = {
  swFile: 'public/sw.js',
  staticFileGlobs: [
    'public/**.css',
    'public/**.png',
    'public/**.svg',
    'public/**.json'
  ],
  stripPrefix: 'public/',
  runtimeCaching: [{
    urlPattern: /^https:\/\/(www.)?monzobalance\.co.uk/,
    handler: 'networkFirst'
  }]
}
