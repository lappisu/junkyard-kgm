const MEMBER_PATTERNS = [
	"https://*.kogama.com/game/*/member/*",
	"https://kogama.com.br/game/*/member/*"
];
const MEMBER_AMOUNT = 400;

function memberListener(details) {
	const url = new URL(details.url);
	if (
		!url.searchParams.has("count")
		|| Number(url.searchParams.get("count")) === MEMBER_AMOUNT
	) return ({});
	url.searchParams.set("count", MEMBER_AMOUNT.toString());
	return ({ redirectUrl: url.href });
}

chrome.webRequest.onBeforeRequest.addListener(
	memberListener,
	{ urls: MEMBER_PATTERNS, types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);