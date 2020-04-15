const pupHelper = require('./puppeteerhelper');
const pLimit = require('p-limit');
const fs = require('fs');
const moment = require('moment');
const {noOfRequests, simultaneousRequests, siteLink} = require('./keys');
let browser;

(async () => {
  try {
    if (fs.existsSync('logs.csv')) fs.unlinkSync('logs.csv');
    browser = await pupHelper.launchBrowser();

    console.log(`Script Sarted at: ${moment().format()} for: ${siteLink}`);

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
    console.log(`Script Completed at: ${moment().format()} for: ${siteLink}`);
    return 'Completed...';
  } catch (error) {
    return error;
  }
})();

const sendRequest = (index) => new Promise(async (resolve, reject) => {
  let page;
  try {
    page = await pupHelper.launchPage(browser);
    let response;

    response = await page.goto(siteLink, {
      timeout: 0,
      waitUntil: 'load'
    });
    
    fs.appendFileSync('logs.csv', `"${index+1}/${noOfRequests}","${response.status()}","${response.statusText()}","${moment().format()}","${siteLink}"\n`);
    console.log(`${index+1}/${noOfRequests} - ${response.status()} - ${response.statusText()} - ${moment().format()} - ${siteLink}`);
    
    await page.close();
    resolve(true);
  } catch (error) {
    if (page) await page.close();
    console.log(`sendRequest [${index}] Error: ${error}`);
    reject(error);
  }
})
