const pupHelper = require('./puppeteerhelper');
const pLimit = require('p-limit');
const fs = require('fs');
const moment = require('moment');
let browser;
const noOfRequests = 1000;
const simultaneousRequests = 10;
const pageURL = 'https://www.lowes.com/pd/DEWALT-5-Tool-20-Volt-Max-Power-Tool-Combo-Kit-with-Soft-Case-Charger-Included-and-2-Batteries-Included/3441520';

(async () => {
  try {
    if (fs.existsSync('logs.csv')) fs.unlinkSync('logs.csv');
    browser = await pupHelper.launchBrowser();

    console.log(`Script Sarted at: ${moment().format()} for: ${pageURL}`);

    fs.writeFileSync('logs.csv', '"RequestNumber","StatusCode","StatusText","DateTime","URL"\n', 'utf8');
    console.log('RequestNumber - StatusCode - StatusText - DateTime - URL');
    
    const limit = pLimit(simultaneousRequests);
    const promises = [];

    for (let i = 0; i < noOfRequests; i++) {
      promises.push(limit(() => sendRequest(i)));
    }

    await Promise.all(promises);
    
    await page.close();
    await browser.close();
    console.log(`Script Completed at: ${moment().format()} for: ${pageURL}`);
    return 'Completed...';
  } catch (error) {
    return error;
  }
})();

const sendRequest = (index) => new Promise(async (resolve, reject) => {
  let page;
  try {
    page = await pupHelper.launchPage(browser);

    const response = await page.goto(pageURL, {
      timeout: 0,
      waitUntil: 'load'
    });
    
    fs.appendFileSync('logs.csv', `"${index+1}/${noOfRequests}","${response.status()}","${response.statusText()}","${moment().format()}","${pageURL}"\n`);
    console.log(`${index+1}/${noOfRequests} - ${response.status()} - ${response.statusText()} - ${moment().format()} - ${pageURL}`);
    
    await page.close();
    resolve(true);
  } catch (error) {
    if (page) await page.close();
    console.log(`sendRequest [${index}] Error: ${error}`);
    reject(error);
  }
})
