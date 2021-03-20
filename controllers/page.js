async function startPage(browser) {
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 800 });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() == 'font' || req.resourceType() == 'image') {
        req.abort();
      }
      else {
        req.continue();
      }
    });
  } catch (err) {
    console.log("Could not create a new page => : ", err);
  }
  return page;
}

module.exports = {
  startPage
};