getLocaleStrings(pageData.locale, [
	"TranslationCredit",
	"General:Data:Save",
	"General:Data:Load",
	"General:Data:Clear",
]).then(([TranslationCredit, SaveLocale, LoadLocale, ClearLocale]) => {
	const creditContainer = createTranslationCreditContainer(TranslationCredit);
	const dataContainer = createDataContainer(SaveLocale, LoadLocale, ClearLocale);
	const profileLinks = document.querySelector(".profile-links");
	profileLinks.append(creditContainer, dataContainer);
});

//	Translation Credit
function createTranslationCreditContainer(TranslationCredit) {
	const container = document.createElement("DIV");
	const icon = new Image;
	const credit = document.createElement("SPAN");

	icon.width = 16;
	icon.height = 16;
	icon.src = browser.runtime.getURL("/resources/icons/icon_48.png");
	icon.setAttribute("title", `KoGaMa Buddy (${browser.runtime.getManifest().version})`);
	credit.appendChild(document.createTextNode(TranslationCredit));
	container.classList.add("translation-credit");
	container.append(icon, credit);

	return container;
}

//	Data Management
function createDataContainer(SaveLocale, LoadLocale, ClearLocale) {
	const container = document.createElement("DIV");
	const saveButton = document.createElement("BUTTON");
	const loadButton = document.createElement("BUTTON");
	const clearButton = document.createElement("BUTTON");

	saveButton.innerText = SaveLocale;
	loadButton.innerText = LoadLocale;
	clearButton.innerText = ClearLocale;

	saveButton.addEventListener("click", async () => {
		try {
			const data = await browser.storage.local.get();
			const amount = Object.keys(data).length;
			await browser.storage.sync.clear();
			if (amount !== 0) await browser.storage.sync.set(data);
			const SuccessLocale = await getLocaleString(pageData.locale, "General:Data:SaveSuccess");
			return displayNotification(SuccessLocale.replace("{{amount}}", amount), "success");
		} catch(error) {
			console.error(error);
			const ErrorLocale = await getLocaleString(pageData.locale, "General:Data:Error");
			return displayNotification(ErrorLocale.replace("{{error}}", (error.message || error)));
		}
	});

	loadButton.addEventListener("click", async () => {
		try {
			const data = await browser.storage.sync.get();
			const amount = Object.keys(data).length;
			await browser.storage.local.clear();
			if (amount !== 0) await browser.storage.local.set(data);
			const SuccessLocale = await getLocaleString(pageData.locale, "General:Data:LoadSuccess");
			return displayNotification(SuccessLocale.replace("{{amount}}", amount), "success");
		} catch(error) {
			console.error(error);
			const ErrorLocale = await getLocaleString(pageData.locale, "General:Data:Error");
			return displayNotification(ErrorLocale.replace("{{error}}", (error.message || error)));
		}
	});

	clearButton.addEventListener("click", async () => {
		try {
			await browser.storage.local.clear();
			const SuccessLocale = await getLocaleString(pageData.locale, "General:Data:ClearSuccess");
			return displayNotification(SuccessLocale, "success");
		} catch(error) {
			console.error(error);
			const ErrorLocale = await getLocaleString(pageData.locale, "General:Data:Error");
			return displayNotification(ErrorLocale.replace("{{error}}", (error.message || error)));
		}
	});

	container.classList.add("kb-data-container");
	container.append(saveButton, loadButton, clearButton);

	return container;
}