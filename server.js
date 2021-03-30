const fs = require("fs");
const puppeteer = require("puppeteer");
const screenshot = `./screenshot/`;



(async () => {
	try {
		const browser = await puppeteer.launch({
			headless: false,
		});
		const page = await browser.newPage();
		await page.goto("https://web.shad.ir/", {
			waitUntil: "networkidle2",
		});

		await restoreLocalStorage(page);

		const checkAuth = await page.evaluate(() => {
			return !!document.querySelector(".login_form_head"); // !! converts anything to boolean
		});
		if (checkAuth) {
			await page.type("[name='phone_number']", "9919752088");
			await page.click('[msgid="modal_next"]');
			await page.click('[rb-localize="modal_ok"]');

			await delay(40 * 1000);

			await saveLocalStorage(page);
		}

		for (i = 1; i < 40; i++) {
			await page.click(
				`body > div.page_wrap > app-root > span > div.im_page_wrap.clearfix > div > rb-chats > div > div.im_dialogs_col > div > div.im_dialogs_scrollable_wrap.nano-content > ul:nth-child(2) > li:nth-child(${i})`
			);
			await delay(5 * 1000); //TODO WORK

			const pageClicked = await page.evaluate(() => {
				return !!document.querySelector(".poll-title"); // !! converts anything to boolean
			});
			if (pageClicked) {
				// you had the condition reversed. Not sure if it was intended.
				console.log("True");
				await page.screenshot({ path: screenshot+`${Date.now()}.png` });
			} else {
				console.log("false");
			}
		}

		
	} catch (error) {
		if (error) console.log(error);
	}
})();




const delay = (time) => {
	return new Promise(function (resolve) {
		setTimeout(resolve, time);
	});
};

const saveLocalStorage = async (page) => {
	console.log("saving");
	const json = await page.evaluate(() => {
		let json = {};
		json["auth"] = localStorage.getItem("auth");
		return json;
	});
	console.log(json);
	fs.writeFileSync(`${__dirname}/local.json`, JSON.stringify(json));
};

const restoreLocalStorage = async (page) => {
	let json = JSON.parse(fs.readFileSync(`${__dirname}/local.json`));
	await page.evaluate((json) => {
		localStorage.clear();
		localStorage.setItem("auth", json["auth"]);
	}, json);
	await Promise.all([
		page.reload(),
		page.waitForNavigation({ waitUntil: "networkidle0" }),
	]);
};
