/*** Authentication ***/
const AUTHENTICATION_PATTERNS = [
	"https://*.kogama.com/auth/*/",
	"https://kogama.com.br/auth/*/"
];
//	Retrieve clientID efficiently with a simple API trick!
async function retrieveClientID(server) {
	const res = await fetch(`${getServerURL(server)}/user/username/`);
	return res.redirected ? parseNumber(res.url) : 0;
}
//	Update stored clientID on login/logout
async function updateClientID(details) {
	const server = getServerFromURL(details.url);
	if (details.url.endsWith("/auth/logout/")) {
		return CLIENT_IDS[server] = 0;
	} else {
		const clientID = await retrieveClientID(server);
		return CLIENT_IDS[server] = clientID;
	}
}

/*** Prefered Client ***/
const COOKIE_PATTERN = /_pp=(\w+);?/;
const USERNAME_ENDPOINTS = [
	"https://*.kogama.com/user/username/",
	"https://kogama.com.br/user/username/"
];
const GAMEPLAY_PATTERNS = [
	"https://*.kogama.com/games/play/*",
	"https://kogama.com.br/games/play/*",
	"https://*.kogama.com/build/*/project/*",
	"https://kogama.com.br/build/*/project/*",
	"https://*.kogama.com/build/*/avatar/*",
	"https://kogama.com.br/build/*/avatar/*"
];
//	Retrieve prefered client from parameters or cookies
function updateKoGaMaClient(details) {
	const server = getServerFromURL(details.url);
	if (details.url.toLowerCase().includes("webgl=1")) {
		return KOGAMA_CLIENTS[server] = "WEBGL";
	} else if (
		details.url.toLowerCase().includes("standalone=1")
		|| details.url.toLowerCase().includes("standalone2=1")
	) {
		return KOGAMA_CLIENTS[server] = "STANDALONE";
	}
	const cookie = details.requestHeaders.find(header => header.name.toLowerCase() === "cookie");
	if (cookie) {
		const match = COOKIE_PATTERN.exec(cookie.value);
		return KOGAMA_CLIENTS[server] = match ? match[1] : "WEBGL";
	} else {
		return KOGAMA_CLIENTS[server] = "WEBGL";
	}
}

// Register listeners - read only
chrome.webRequest.onCompleted.addListener(
	updateClientID,
	{ urls: AUTHENTICATION_PATTERNS }
);
chrome.webRequest.onSendHeaders.addListener(
	updateKoGaMaClient,
	{ urls: [ ...USERNAME_ENDPOINTS, ...GAMEPLAY_PATTERNS ], types: [ "xmlhttprequest", "main_frame" ] },
	[ "requestHeaders" ]
);

// Script start
for (const url of Object.values(SERVER_URLS)) {
	updateClientID({ url }).catch(async () => {
		const sleep = ms => new Promise(f => setTimeout(f, ms));
		try {
			for (const delay of [ 5e3, 5e3, 5e3 ]) {
				await sleep(delay);
				updateClientID({ url });
				return;
			}
		} catch(_) {}
	});
}