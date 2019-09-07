const { container, event, config, output, recorder } = require('codeceptjs');

const defaultConf = {
  hostname: 'browsers.aerokube.com',
  port: 4444,
  protocol: 'https',
  path: '/wd/hub',
  logLevel: 'silent',
};

/**
 * 
 * Run WebDriver and Puppeteer tests in [cloud browsers provided by Aerokube](https://browsers.aerokube.com).
 * Aerokube provides lightning fast and comparable cheap browsers. To use with CodeceptJS enable this plugin:
 * 
 * 
 * ```js
 * // codecept.conf.js config 
 * exports.confg = {
 *   // regular config goes here
 *   plugins: {
 *      aerokube: {
 *        require: '@codeceptjs/aerokube-plugin',
 *        user: '<username from aerokube>',
 *        password: '<password from aerokube>',
 *      }
 *   } 
 * }
 * ```
 * 
 */
module.exports = (conf) => {

    conf = Object.assign(conf, defaultConf);
    conf.key = conf.password;
    conf.capabilities = {
      browserName: conf.browserName,
      browserVersion: conf.browserVersion,
      platformName: conf.platformName || 'LINUX',
    };
  
    const helpersConf = config.get('helpers');

    if (helpersConf.WebDriver) return connectWebDriver(conf);

    if (helpersConf.Puppeteer) return connectPuppeteer(conf);

    output.error('WebDriver or Puppeteer not connected, aerokube plugin ignored');
  
}

function connectWebDriver(conf) {
  output.print('Starting Aerokube Browsers session for WebDriver...');
  const WebDriver = container.helpers('WebDriver');
  WebDriver._setConfig(Object.assign(WebDriver.options, conf));
}

function connectPuppeteer(conf) {
  const { remote } = require('webdriverio');
  output.print('Starting Aerokube Browsers session for Puppeteer...');
  const Puppeteer = container.helpers('Puppeteer');

  if (Puppeteer.options.restart) {
    event.dispatcher.on(event.test.before, launchPuppeteer);
    return;
  }

  event.dispatcher.on(event.all.before, launchPuppeteer);
 
  function launchPuppeteer() {
    recorder.add('creating browser session', async () => {
      const browser = await remote(conf);
      Puppeteer.isRemoteBrowser = true;
      Puppeteer.puppeteerOptions = { browserWSEndpoint: `wss://${conf.hostname}:4444/devtools/${browser.sessionId}/` }
    });
  }
}
