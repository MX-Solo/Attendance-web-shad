const fs = require("fs");
const address = "https://web.shad.ir/";
const number = JSON.parse(fs.readFileSync("./number.txt"));
// const lesson = [
// 	"#c=g0XDuu0dcef000de5786ee24ba3533eb",
// 	"#c=g0XEMW0585ff66513ab8eb2dd24f0bcb",
// 	"#c=g0Vqcy09685c994577491d45f94ded21",
// 	"#c=g0awC60cfe70f0fbdf06b214ff6f3c7e",
// 	"#c=g0VgTW0f85ec56c7edca46b1277ae27d",
// 	"#c=g0Vr920f1e4cd98e5933a15f0be0b3d9",
// 	"#c=g0UpSn0f8336f707fe7d9b110d78cda0",
// 	"#c=g0XGoi021835dfd3a4f444c4d8f3e461",
// 	"#c=g0bTqb00fc2cf677463cabecda9e2838",
// 	"#c=g0VkHy0fa059cda8fd8296974a68a81c",
// 	"#c=g0Vpar0acd4c4b4495778833dd2a5c52",
// 	"#c=g0Vozi058b7b2064c54f3d55edeb6378",
// ];

// const filename = () => {
// 	var today = new Date();
// 	var date =
// 		today.getFullYear() +
// 		"-" +
// 		(today.getMonth() + 1) +
// 		"-" +
// 		today.getDate();
// 	var time =
// 		today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
// 	var dateTime = date + "_" + time;
// 	return `./screenshot/${dateTime}.png`;
// };

const delay = (time) => {
	return new Promise(function (resolve) {
		setTimeout(resolve, time);
	});
};

const checkAuth = async (page) => {
	const checkAuth = await page.evaluate(() => {
		return !!document.querySelector(".login_form_head"); // !! converts anything to boolean
	});
	if (checkAuth) {
		await page.type("[name='phone_number']", `${number}`);
		await page.click('[msgid="modal_next"]');
		await page.click('[rb-localize="modal_ok"]');

		await delay(40 * 1000);

		await saveLocalStorage(page);
	}
};
const saveLocalStorage = async (page) => {
	console.log("Saving Authenticate Code");
	const json = await page.evaluate(() => {
		let json = {};
		json["auth"] = localStorage.getItem("auth");
		return json;
	});
	console.log(json);
	fs.writeFileSync(`./controller/local.json`, JSON.stringify(json));
};

const restoreLocalStorage = async (page) => {
	console.log("Check Your Authenticate ...");
	let json = JSON.parse(fs.readFileSync(`./controller/local.json`));
	if (!json) return;
	await page.evaluate((json) => {
		localStorage.clear();
		localStorage.setItem("auth", json["auth"]);
	}, json);
	await Promise.all([
		page.reload(),
		page.waitForNavigation({ waitUntil: "networkidle0" }),
	]);
};

const findPeresnceBox = async (page) => {
	console.log("Start For Check PeresnceBox ...");
	for (i = 1; i < 40; i++) {
		await page.click(
			`body > div > app-root > span > div.im_page_wrap.clearfix > div > rb-chats > div > div.im_dialogs_col > div > div.im_dialogs_scrollable_wrap.nano-content > ul:nth-child(2) > li:nth-child(${i})`
		);

		await delay(5 * 1000); //TODO WORK

		const pageClicked = await page.evaluate(() => {
			return !!document.querySelector(".poll-title"); // !! converts anything to boolean
		});
		if (pageClicked) {
			page.click(".poll-title");
			// await page.screenshot({
			// 	path: filename(),
			// });
		}
	}
};

const browserConfig = async (puppeteer) => {
	console.log("Open Your Browser ...");
	const browser = await puppeteer.launch({
		headless: false,
	});
	const page = await browser.newPage();

	await page.goto(address, {
		waitUntil: "networkidle2",
	});
	return page;
};

const handleError = async (err) => {
	if (err) {
		console.log(err);
		fs.appendFileSync(
			"./controller/log.txt",
			`\n ${err.stack} \n _____________________________ `
		);
	}
};

module.exports = {
	restoreLocalStorage,
	checkAuth,
	findPeresnceBox,
	browserConfig,
	handleError,
	delay,
};
