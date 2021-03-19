const puppeteer = require('puppeteer');

(async () => {
	let listLink = [];
	let browser = await puppeteer.launch({
		userDataDir: "./cache",
		args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
		headless: false,
	});
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1366, height: 800 });
		await page.goto("https://medium.com", { waitUntil: "networkidle2" });
		await autoScroll(page);

		for (let i = 1; i <= 1; i++) {
			let LINK_QUERY = `#root > div > div.an.do > div.ev.z.ih.ii.ij > div > div > div > div.r.s.t.u > div > div.z > div:nth-child(${i}) > div > div > div > a`;
			try {
				let href = await page.$eval(LINK_QUERY, el => el.href);
				listLink.push({
					id: "link-is-" + i,
					link: href,
				});
			} catch (error) {
				// await autoScroll(page);
				console.log("error at child " + i);
			}
		}
		console.log(listLink.length);
		await browser.close();
	}
	catch (e) {
		console.log('Medium scrap error -> ', e);
		await browser.close();
	}

	// listLink.length = 1;
	let browserLink = await puppeteer.launch({
		userDataDir: "./cache",
		args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
		headless: false,
	});
	listLink.forEach(async (data, index) => {
		if (index >= 200) return;

		console.log(data.link);
		const page = await browserLink.newPage();
		await page.setViewport({ width: 1366, height: 800 });
		await page.goto(data.link, { waitUntil: "networkidle2" });
		await browserLink.close();

	});
})();


async function autoScroll(page) {
	await page.evaluate(async () => {
		await new Promise((resolve, reject) => {
			let distance = 200;
			let count = 0;
			let timer = setInterval(() => {
				window.scrollBy(0, distance);
				if (count > 1) {
					clearInterval(timer);
					resolve();
				}
				count++;
			}, 20);
		});
	});
}