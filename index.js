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
 * **Aerokube provides lightning fast and comparable cheap browsers** without pain of maintaining own infrastructure.
 * This plugin works with WebDriver and Puppeteer helpers of CodeceptJS.
 * 
 * > If you need to host cloud browsers on your own infrastructure consider browsers in Kubernetes with [Aerokube Moon](https://aerokube.com/moon/)
 * 
 * ## Setup
 * 
 * Install this plugin in CodeceptJS project.
 * 
 * ```
 * npm i @codeceptjs/aerokube-plugin --save-dev
 * ```
 * 
 * Enable the plugin in `codecept.conf.js`
 * 
 * ```js
 * // codecept.conf.js config 
 * exports.config = {
 *   helpers: {
 *      // regular Puppeteer config
 *      // or regular WebDriver config
 *   },
 *   // ....
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
 * > It is recommended to use `dotenv` package to store `username` and `password` from Aerokube Browsers. See the config in `example` dir.
 * 
 * To run tests in cloud, enable this plugin:
 * 
 * ```
 * npx codeceptjs run --steps -p aerokube
 * ```
 * 
 * > To enable aerokube plugin permanently use `enabled: true`.
 * 
 * ## Usage
 * 
 * ### WebDriver
 * 
 * * Desired capabilities are ignored
 * 
 * ### Puppeteer 
 * 
 * We use `webdriverio` library to initialize a browser session and obtain DevTool Protocol API credentials.
 * 
 * * `windowSize` option is used to set initial window size. Not viewport size.
 * * Chrome starting options are ignored.
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

      if (!conf.windowSize) return;
      if (width === 'maximize') return browser.maximizeWindow();
      const [width, height] = conf.windowSize.split('x');
      if (browser.isW3C) {
        return browser.setWindowRect(null, null, parseInt(width, 10), parseInt(height, 10));
      } 
      return browser.setWindowSize(parseInt(width, 10), parseInt(height, 10));
    });

  }
}
