const SESSION_PATTERN = "https://*.kgoma.com/v1/locator/session/*";

const SESSION_IGNORE = [
	"ping",
	"leave",
	"launch=1"
];

async function preventLaunch({ url, tabId }) {
	const server = getServerFromURL(url);
	if (
		SESSION_IGNORE.some(pattern => url.includes(pattern))
		|| KOGAMA_CLIENTS[server] !== "STANDALONE"
		|| tabId < 0
	) return ({});
	const clientID = getClientID(server);
	const launchOption = await getStoredData(`${server}:${clientID}:automatic_standalone`, "LAUNCH");
	return ({ cancel: launchOption === "PREVENT" });
}

chrome.webRequest.onBeforeSendHeaders.addListener(
	preventLaunch,
	{ urls: [ SESSION_PATTERN ], types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);