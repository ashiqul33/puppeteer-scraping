const { startBrowser } = require("./browser");
const { startPage } = require("./page");
const fs = require('fs');

async function medium(req, res) {
	const pages = req.params.pages;
	let listLink = [];
	let browser = await startBrowser();
	try {
		const page = await startPage(browser);
		await page.goto("https://medium.com", { waitUntil: "networkidle2" });
		if (pages > 23) {
			let len = pages - 23;
			for (let i = 0; i < len; i++) {
				await autoScroll(page);
			}
		}

		const LINK_QUERY = `#root > div > div.an.do > div.ev.z.ih.ii.ij > div > div > div > div.r.s.t.u > div > div.z > div.af.dn > div > div > div > a`;
		listLink = await page.$$eval(LINK_QUERY, elements => {
			let list = [];
			elements.forEach((ele, index) => {
				if (index >= 200) return;
				list.push({
					id: "link-medium-" + (index + 1),
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
	const dataArray = await listPageScrapM(listLink, pages);
	res.json(dataArray);
}

async function listPageScrapM(listLink, pages) {
	if (pages < 200 && listLink.length > pages) listLink.length = pages;
	let browserLink = await startBrowser();

	let dataArray = [];
	const TITLE_LINK = "#root > div > div.s > article > div > section > div > div > div h1";
	const AUTHOR_LINK = "#root > div > div.s > article > div > section > div > div span a";
	const DATE_READ_LINK = "#root > div > div.s > article > div > section > div > div > div > div > div > div > div > span";
	const AUTHOR_IMG = "#root > div > div.s > article > div > section > div > div > div > div > div > div.o.n > div > a img";
	const POST_IMG = "#root > div > div > article > div > section > div figure div > img";
	const TEXT = "#root > div > div.s > article > div > section > div > div > p";
	for (let i = 0; i < listLink.length; i++) {
		try {
			const page = await startPage(browserLink);
			await page.goto(listLink[i].link, { waitUntil: "networkidle2" });
			let title = await page.$eval(TITLE_LINK, el => el.textContent.trim());

			// -------- find data from visited page --------- //
			let author = await page.$eval(AUTHOR_LINK, el => el.textContent.trim());
			let date_read = await page.$eval(DATE_READ_LINK, el => el.textContent.trim());
			let [date, read] = date_read.split("·");
			let auth_img, post_img;
			try {
				auth_img = await page.$eval(AUTHOR_IMG, el => el.src);
			}
			catch (e) {
				auth_img = "";
				// console.log(e);
			}
			try {
				post_img = await page.$eval(POST_IMG, el => el.src);
			}
			catch (e) {
				post_img = "";
				// console.log(e);
			}
			let text = await page.$$eval(TEXT, el => {
				let para = [];
				for (let i = 0; i < el.length; i++) {
					para.push({
						id: "text-medium-" + (i + 1),
						value: el[i].textContent,
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
				title,
				author,
				date: date.trim(),
				read: read.trim(),
				auth_img,
				post_img,
				text,
			});
			await page.close();
		}
		catch (e) {
			// console.log(listLink[i].link);
			// await page.close();
			console.log(e);
		}
	}
	await browserLink.close();

	fs.writeFile("./output/medium.json", JSON.stringify(dataArray), function (err) {
		if (err) return console.log(err);
		console.log(`medium ${listLink.length} page done...`);
	});
	return dataArray;
}

async function autoScroll(page) {
	await page.evaluate(async () => {
		await new Promise((resolve, reject) => {
			let timer = setInterval(() => {
				let scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, scrollHeight);
				clearInterval(timer);
				resolve();
			}, 70);
		});
	});
}

module.exports = medium;