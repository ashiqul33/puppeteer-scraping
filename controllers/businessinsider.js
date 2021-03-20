const { startBrowser } = require("./browser");
const { startPage } = require("./page");
const fs = require('fs');

async function businessinsider(req, res) {
  const pages = req.params.pages;
  let listLink = [];
  let browser = await startBrowser();
  try {
    const page = await startPage(browser);
    await page.goto("https://www.businessinsider.com/latest", { waitUntil: "networkidle2" });
    await autoScroll(page);

    const LINK_QUERY = "#l-content > section.river-item.featured-post > section > div.tout-text-wrapper.default-tout > h2 > a";
    listLink = await page.$$eval(LINK_QUERY, elements => {
      let list = [];
      elements.forEach((ele, index) => {
        if (index >= 200) return;
        list.push({
          id: "link-insider-" + (index + 1),
          link: ele.href,
        });
      });
      return list;
    });

    console.log(listLink.length);
    await browser.close();
  }
  catch (e) {
    console.log('BusinessInsider scrap error -> ', e);
    await browser.close();
  }

  const dataArray = await listPageScrapB(listLink, pages);
  res.json(dataArray);
  // console.log(dataArray);
}

async function listPageScrapB(listLink, pages) {
  if (pages < 200 && listLink.length > page) listLink.length = pages;
  let browserLink = await startBrowser();

  let dataArray = [];
  const HEAD_LINK = "#l-main-content > section > section > section.post-headline-wrapper > h1";
  const AUTHOR_LINK = "#l-main-content > section > section > section.byline-wrapper.col-12 > div > div > div > div > div.byline-author.headline-bold";
  const DATE_LINK = "#l-main-content > section > section > section.byline-wrapper.col-12 > div > div > div > div > div.byline-timestamp.headline-regular.js-date-format.js-rendered";
  const COVER_IMG = "#l-content > section > div > article > figure > div > img";
  const TEXT = "#piano-inline-content-wrapper > div > div > p";
  for (let i = 0; i < listLink.length; i++) {
    try {
      const page = await startPage(browserLink);
      await page.goto(listLink[i].link, { waitUntil: "networkidle2" });

      // -------- find data from visited page --------- //
      let head = await page.$eval(HEAD_LINK, el => el.textContent.trim());
      let author = await page.$eval(AUTHOR_LINK, el => el.innerText.trim());
      let date = new Date(await page.$eval(DATE_LINK, el => el.dataset.timestamp));
      let cover_img;
      try {
        cover_img = await page.$eval(COVER_IMG, el => el.src);
      }
      catch (e) {
        cover_img = "";
        // console.log(e);
      }
      let text = await page.$$eval(TEXT, el => {
        let para = [];
        for (let i = 0; i < el.length; i++) {
          para.push({
            id: "text-ins-" + (i + 1),
            value: el[i].innerText,
          });
        }
        return para;
      });
      // ----x---- find data from visited page -----x---- //
      console.log("Page: " + (i + 1) + " -> Done");

      // push object data to array one by one
      dataArray.push({
        id: listLink[i].id,
        link: listLink[i].link,
        head,
        author,
        date,
        cover_img,
        text,
      });
      await page.close();
    }
    catch (e) {
      console.log(listLink[i].link);
      // await page.close();
      // console.log(e);
    }
  }
  await browserLink.close();
  return dataArray;
}

async function autoScroll(page) {
  await page.$eval("#l-content > a", btn => btn.click());
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let distance = 300;
      let count = 0;
      let timer = setInterval(() => {
        window.scrollBy(0, distance);
        if (count > 400) {
          clearInterval(timer);
          resolve();
        }
        count++;
      }, 20);
    });
  });
}

module.exports = businessinsider;