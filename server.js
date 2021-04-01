const puppeteer = require("puppeteer");
const fs = require("fs");
const {
	restoreLocalStorage,
	checkAuth,
	findPeresnceBox,
	browserConfig,
	handleError,
	delay,
} = require("./controller/helper");

(async () => {
	try {
		const page = await browserConfig(puppeteer);

		await restoreLocalStorage(page);

		await checkAuth(page);


		while (new Date().getHours() < 13 && new Date().getHours() === 23 && new Date().getHours() === 0) {
			await findPeresnceBox(page);

			await delay(5 * 60 * 1000); //TODO WORK
		}
		console.log('End :)');
		page.close();
	} catch (err) {
		handleError(err);
	}
})();
