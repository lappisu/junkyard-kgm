const PROFILE_PAGE_REGEX = /profile\/\d+\/$/;
const PROFILE_PAGE_PATTERN = [
	"https://*.kogama.com/profile/*/",
	"https://kogama.com.br/profile/*/"
];

async function blockProfile(details) {
	// Do not affect any other profile-related pages
	if (!PROFILE_PAGE_REGEX.test(details.url)) return;

	// Get blocked users list associated with current server and user
	const server = getServerFromURL(details.url);
	const clientID = getClientID(details.url);
	const profileID = parseNumber(details.url);
	const blockedUsers = await getStoredData(`${server}:${clientID}:blocked_users`, []);
	//	Make no changes if user is not blocked
	if (!blockedUsers.includes(profileID)) return;

	let response = "";
	const filter = chrome.webRequest.filterResponseData(details.requestId);
	filter.ondata = ({ data }) => response += textDecoder.decode(data, { stream: true });
	filter.onstop = async () => {
		const profileDocument = domParser.parseFromString(response, "text/html");

		const initScript = profileDocument.querySelector("body > script:first-of-type");
		const initScriptText = initScript.innerText.split("\n").map(line => line.trim()).join(" ");
		const pageData = parsePageData(initScriptText);
		const [
			blockedHeaderLocale,
			unblockButtonLocale
		] = await getLocaleStrings(pageData.locale, [
			"Background:BlockProfile:BlockedHeader",
			"Background:BlockProfile:UnblockButton"
		]);
		const profilePage = profileDocument.getElementById("profile-page");
		const blockedPage = createElement("article#error-404-page", [
			createElement("h2.page-header", blockedHeaderLocale.replace("{{username}}", pageData.object.username)),
			createElement("button#kb-unblock.section-friend-request.pure-button.pure-button-xsmall.pure-button-primary", unblockButtonLocale)
		]);
		profilePage.replaceWith(blockedPage);
		profileDocument.body.classList.add("error");
		const catchErrors = initScriptText.replace(/(var page = new App.pages.ProfileMobile\({id: \d+ }\);) App.renderPage\(page\);/, "try { $1 } catch(e) {}");
		initScript.innerText = "var KB_PROFILE_BLOCKED = true; " + catchErrors;

		const documentHTML = "<!DOCTYPE html>" + profileDocument.documentElement.outerHTML;
		filter.write(textEncoder.encode(documentHTML));
		filter.close();
	};
}

chrome.webRequest.onBeforeRequest.addListener(
	blockProfile,
	{ urls: PROFILE_PAGE_PATTERN, types: [ "main_frame" ] },
	[ "blocking" ]
);