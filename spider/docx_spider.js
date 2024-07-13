import fs from "fs";
import { DB_CONFIG } from "../configs.js";
import { logger } from "../log.js";

export async function fetch_single_docx(page, url) {
  logger.info("goto %s", url);
  await page.goto(url);
  await page.waitForSelector(".root-block");
  return await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      console.info = console.error;
      var result = {
        title: $($(".ace-line")[0]).text().trim(),
        blocks_json: window.DATA.clientVars.data, // more data: https://bytedance.larkoffice.com/space/api/docx/pages/client_vars?xxxxx
        blocks: [],
      };
      var main_page_elem = $(".bear-web-x-container")[0];
      var last_scroll_top = main_page_elem.scrollTop;
      var block_ids = new Set();

      main_page_elem.scrollTo(0, 0);
      var timer = setInterval(() => {
        main_page_elem.scrollBy(0, document.body.clientHeight / 2);
        console.info("main_page_elem.scrollTop", main_page_elem.scrollTop);

        var block_elems = $(
          ".root-render-unit-container>.render-unit-wrapper>.block"
        );
        for (var i = 0; i < block_elems.length; i++) {
          var block_elem = block_elems[i];
          var block_id = block_elem.getAttribute("data-block-id");
          if (!block_ids.has(block_id)) {
            console.info(`#${block_id}`, block_elem);
            result.blocks.push({ block_id, html: block_elem.outerHTML });
            block_ids.add(block_id);
          }
        }
        if (last_scroll_top == main_page_elem.scrollTop) {
          clearInterval(timer);
          resolve(result);
          return;
        }
        last_scroll_top = main_page_elem.scrollTop;
      }, 1000);

      console.info(result);
      //return result;
    });
  });
}

export async function fetch_all_docx(db, page) {
  //const db_collection = db.collection(DB_CONFIG.collection_name);

  const urls = [
    "https://bytedance.larkoffice.com/docx/RnHsdDC3ioZYIlxwBjaceFAlnAd",
  ];
  for (var key in urls) {
    var url = urls[key];
    const result = await fetch_single_docx(page, url);
    console.log("result", result);
    if (result) {
      var filename = `./out/${url.substring(url.lastIndexOf("/"))}.html`;
      var content = `<html><head><title>${result.title.trim()}</title></head><body>`;
      result.blocks.forEach((block) => (content += block.html));
      content += "</body></html>";
      fs.writeFileSync(filename, content);
      console.log("write to file", filename);
    }
  }
}
