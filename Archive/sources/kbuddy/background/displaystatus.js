const PULSE_PATTERNS = [
	"https://*.kogama.com/user/*/pulse/",
	"https://kogama.com.br/user/*/pulse/"
];

async function displayStatus(details) {
	if (details.tabId < 1) return;
	const server = getServerFromURL(details.url);
	const clientID = getClientID(server);
	const status = await getStoredData(`${server}:${clientID}:status`, "ONLINE");

	if (status === "OFFLINE") {
		return ({ cancel: true });
	} else if (details.originUrl.includes("/project/")) {
		const projectStatus = await getStoredData(`${server}:${clientID}:project_status`, "HIDDEN");
		if (projectStatus === "HIDDEN") {
			fetch(details.url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "same-origin",
				body: JSON.stringify({
					location: "/",
					status: "active"
				})
			});
			return ({ cancel: true });
		}
	}
	return;
}

chrome.webRequest.onBeforeRequest.addListener(
	displayStatus,
	{ urls: PULSE_PATTERNS, types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);