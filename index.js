import puppeteer from 'puppeteer-core';
import {MongoClient} from 'mongodb';
import {DB_CONFIG, BROWSER_CONFIG} from './configs.js';
import {fetch_all_docx} from './spider/docx_spider.js';
import {logger} from './log.js';

const Enabled = {
  spliders: [
    {
      name: 'docx',
      func: fetch_all_docx,
      enabled: true,
    },
  ],
};

async function invoke_with_retry(func, max_retry, ...args) {
  var retry = 0;
  while (retry < max_retry) {
    try {
      await func.apply(null, args);
      break;
    } catch (e) {
      logger.error(e);
      console.trace();
    }
    retry++;
    logger.warn("retry %d", retry);
  }
}

(async () => {
  logger.info('start');
  //const db_client = new MongoClient(DB_CONFIG.url);
  //await db_client.connect();
  //const db = db_client.db(DB_CONFIG.db_name);
  const db = null;

  const spiders_enabled = Enabled.spliders.filter(item => item.enabled);
  logger.info(
    '[config] spiders_enabled: %s',
    spiders_enabled.map(item => item.name).join(" ")
  );
  if (spiders_enabled.length > 0) {
    const browser = await puppeteer.launch(Object.assign(BROWSER_CONFIG, {}));
    const page = await browser.newPage();
    //page.on("console", (msg) => logger.info("[PAGE LOG]", msg.text()));
    await page.setViewport({width: 1080, height: 1024});

    for (var key in spiders_enabled) {
      var spider = spiders_enabled[key];
      logger.info('[stage] exec spider %s', spider.name);
      await invoke_with_retry(spider.func, 3, db, page);
    }

    //await page.waitForTimeout(10 * 1000);
    logger.info('close the browser');
    await browser.close();
  }

  //await db_client.close();
  logger.info('end');
})();
