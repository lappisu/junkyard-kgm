const locales = new Map();
const validLocales = new Set([
	"EN", "PT", "FR", "ES", "RU"
]);

function resolveLanguage(language) {
	const langCode = language.split("_")[0].toUpperCase();
	return validLocales.has(langCode) ? langCode : "EN";
}

async function getLocaleString(language, string_key) {
	const langCode = resolveLanguage(language);
	if (locales.has(langCode)) return locales.get(langCode)[string_key];
	const location = chrome.runtime.getURL(`/locales/${langCode}.json`);
	const locale = await fetch(location).then(r => r.json());
	locales.set(langCode, locale);
	return locale[string_key];
}

async function getLocaleStrings(language, string_keys) {
	const langCode = resolveLanguage(language);
	if (locales.has(langCode)) {
		const locale = locales.get(langCode);
		return string_keys.map(key => locale[key]);
	} else {
		const location = chrome.runtime.getURL(`/locales/${langCode}.json`);
		const locale = await fetch(location).then(r => r.json());
		locales.set(langCode, locale);
		return string_keys.map(key => locale[key]);
	}
}

function messageListener(message) {
	switch (message.type) {
		case "GET_LOCALE_STRING":
			return getLocaleString(message.data.language, message.data.string);
		case "GET_LOCALE_STRINGS":
			return getLocaleStrings(message.data.language, message.data.strings);
		default:
			return false;
	}
}

chrome.runtime.onMessage.addListener(messageListener);