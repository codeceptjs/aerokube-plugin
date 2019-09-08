require('dotenv').config();

exports.config = {
  tests: './*_test.js',
  output: './output',
  helpers: {
    WebDriver: {
      url: 'http://localhost',
      browser: 'chrome',
      windowSize: '1600x1000',
      someRandomOption: 'xxx',
    }
  },

  plugins: {
    aerokube: {
      enabled: true,
      require: '../index',
      user: process.env.ACCOUNT,
      password: process.env.PASSWORD,
      browserName: 'chrome',
      browserVersion: '76.0',
      platformName: 'LINUX',      
    }
  },
  include: {},
  bootstrap: null,
  mocha: {},
  name: 'example'
}


if (process.env.PUPPETEER) {
  exports.config.helpers = {
    Puppeteer: {
      url: 'http://localhost',
      // restart: true,
    }
  }
}