/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

const puppeteer = require('puppeteer');
const path = require('path');

let browser;
return puppeteer
  .launch()
  .then(b => {
    browser = b;
    return b.newPage();
  })
  .then(
    page =>
      new Promise(async (resolve, reject) => {
        page.on('console', msg => {
          console.log(msg.text());
        });
        await page.goto(
          process.argv[2] || `file:${path.join(__dirname, 'run-mocha.html')}`,
        );
        return page
          .evaluate(
            () =>
              new Promise((res, rej) => {
                setInterval(() => {
                  if (window.mocha.stats) {
                    if (
                      window.mocha.failures === 0 &&
                      window.mocha.tests === window.mocha.passes
                    ) {
                      res(window.mocha.stats);
                    } else {
                      rej(window.mocha.stats);
                    }
                  }
                }, 500);
              }),
          )
          .then(resolve, reject);
      }),
  )
  .then(
    res => {
      browser.close();
      console.log('success', JSON.stringify(res));
      process.exit(0);
    },
    err => {
      browser.close();
      console.log('failure', JSON.stringify(err));
      process.exit(1);
    },
  );
