const BLOCK_URLS = [
	"https://*.kogama.com/api/feed/*",
	"https://*.kogama.com/api/*/*/comment/*",
	"https://*.kogama.com/model/market/*/comment/*",
	"https://*.kogama.com/game/*/comment/*",
	"https://kogama.com.br/api/feed/*",
	"https://kogama.com.br/api/*/*/comment/*",
	"https://kogama.com.br/model/market/*/comment/*",
	"https://kogama.com.br/game/*/comment/*",
	"https://*.kgoma.com/v1/notify/c/*"
];

async function blockListener(details) {
	//	Ignore data creation methods (POST, PUT)
	if (details.method !== "GET") return;
	//	Get blocked users list associated with current server and user
	const server = getServerFromURL(details.url);
	const clientID = getClientID(details.url);
	const blockedUsers = await getStoredData(`${server}:${clientID}:blocked_users`, []);
	//	Return early if no users are blocked; no changes will be made
	if (!blockedUsers.length) return;

	//	Create data filter to modify response body
	const filter = chrome.webRequest.filterResponseData(details.requestId);
	let data = "";
	filter.ondata = event => {
		data += textDecoder.decode(event.data, { stream: true });
	}
	filter.onstop = () => {
		//	If no data is found, disconnect filter
		if (!data.length) return filter.disconnect();
		const parsed = JSON.parse(data);
		if (parsed.data) {
			//	Filter Posts/Comments made by blocked users
			parsed.data = parsed.data.filter(post => !blockedUsers.includes(post.profile_id));
		} else if (parsed.log) {
			//	Filter Notification Logs involving blocked users
			parsed.log = parsed.log.filter(log => !blockedUsers.includes(JSON.parse(log.data).profile_id));
		}
		filter.write(textEncoder.encode(JSON.stringify(parsed)));
		filter.disconnect();
	};
}

chrome.webRequest.onBeforeRequest.addListener(
	blockListener,
	{ urls: BLOCK_URLS, types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);