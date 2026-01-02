const FRIENDS_LIST_URLS = [
	"https://*.kogama.com/user/*/friend/chat/",
	"https://kogama.com.br/user/*/friend/chat/",
	"https://*.kogama.com/user/*/friend/chat/?full=1",
	"https://kogama.com.br/user/*/friend/chat/?full=1"
];

let lastUpdatedTimestamps = {
	www: 0,
	friends: 0,
	br: 0
};

// If more than 15 minutes have elapsed from previous update, update friends list
function shouldUpdateFriendsList(details) {
	const now = Date.now();
	const url = new URL(details.url);
	const server = getServerFromURL(details.url);
	if (url.searchParams.get("full") === "1") {
		lastUpdatedTimestamps[server] = now;
	} else if (now - lastUpdatedTimestamps[server] > 900000) {
		url.searchParams.set("full", "1");
		return { redirectUrl: url.href };
	}
}

chrome.webRequest.onBeforeRequest.addListener(
	shouldUpdateFriendsList,
	{ urls: FRIENDS_LIST_URLS, types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);