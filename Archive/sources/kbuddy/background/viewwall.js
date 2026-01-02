const FEED_PATTERNS = [
	"https://*.kogama.com/api/feed/*/*",
	"https://kogama.com.br/api/feed/*/*"
];

async function wallFeedListener(details) {
	if (
		details.url.includes("comment")
		|| !details.originUrl.includes("view_wall=1")
		|| details.method !== "GET"
		|| !details.originUrl.includes(getClientID(details.url))
		|| getClientID(details.url) === 0
	) return;
	Promise.all([
		awaitFilter(details.requestId),
		fetch(details.url, { credentials: "omit" }).then(r => r.json())
	]).then(([ filter, selfPosts ]) => {
		selfPosts.data = selfPosts.data.map(post => ({ ...post, can_delete: true }));
		filter.writeJSON(selfPosts);
		filter.close();
	});
}

chrome.webRequest.onBeforeRequest.addListener(
	wallFeedListener,
	{ urls: FEED_PATTERNS, types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);