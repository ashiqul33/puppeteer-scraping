const puppeteer = require('puppeteer');
const fs = require('fs');

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

		const LINK_QUERY = `#root > div > div.an.do > div.ev.z.ih.ii.ij > div > div > div > div.r.s.t.u > div > div.z > div.af.dn > div > div > div > a`;
		listLink = await page.$$eval(LINK_QUERY, elements => {
			let list = [];
			elements.forEach((ele, index) => {
				if (index >= 200) return;
				list.push({
					id: "link-is-" + (index + 1),
					link: ele.href,
				});
			});
			return list;
		});

		console.log(listLink.length);
		await browser.close();
	}
	catch (e) {
		console.log('Medium scrap error -> ', e);
		await browser.close();
	}

	// listLink.length = 5;
	let browserLink = await puppeteer.launch({
		userDataDir: "./cache",
		args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
		headless: false,
	});

	let dataArray = [];
	const HEAD_LINK = "#root > div > div.s > article > div > section > div > div > div h1";
	const AUTHOR_LINK = "#root > div > div.s > article > div > section > div > div span a";
	const DATE_READ_LINK = "#root > div > div.s > article > div > section > div > div > div > div > div > div > div > span";
	const AUTHOR_IMG = "#root > div > div.s > article > div > section > div > div > div > div > div > div.o.n > div > a img";
	const COVER_IMG = "#root > div > div.s > article > div > section > div figure div.s > img";
	const TEXT = "#root > div > div.s > article > div > section > div > div > p";
	for (let i = 0; i < listLink.length; i++) {
		const page = await browserLink.newPage();
		await page.setViewport({ width: 1366, height: 800 });
		await page.goto(listLink[i].link, { waitUntil: "networkidle2" });
		let head = await page.$eval(HEAD_LINK, el => el.textContent.trim());
		let author = await page.$eval(AUTHOR_LINK, el => el.textContent.trim());
		let date_read = await page.$eval(DATE_READ_LINK, el => el.textContent.trim());
		let [date, read] = date_read.split("·");
		let auth_img = await page.$eval(AUTHOR_IMG, el => el.src);
		let cover_img = i > 0 ? await page.$eval(COVER_IMG, el => el.src) : "";
		let text = await page.$$eval(TEXT, el => {
			let para = [];
			for (let i = 0; i < el.length; i++) {
				para.push({
					id: "text-"+(i+1),
					value: el[i].textContent,
				});
			}
			return para;
		});
		console.log("Page: "+i + " -> Done");
		dataArray.push({
			id: listLink[i].id,
			link: listLink[i].link,
			head,
			author,
			date: date.trim(),
			read: read.trim(),
			auth_img,
			cover_img,
			text,
		});
		await page.close();
	}
	await browserLink.close();

	fs.writeFile("medium.json", JSON.stringify(dataArray), function (err) {
		if (err) return console.log(err);
		console.log("medium 200 page done...");
	});
	// console.log(dataArray);
})();


async function autoScroll(page) {
	await page.evaluate(async () => {
		await new Promise((resolve, reject) => {
			let distance = 200;
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