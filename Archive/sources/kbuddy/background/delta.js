// DELTA FERN: Chat Replacement Test
// Connect to extension if available; if not, enable KB chat features.
// If available, provide access to favorite friends.
const DeltaFern = chrome.runtime.connect("deltafern@aethar.net");
DeltaFern.onDisconnect.addListener(async ({ error }) => {
	if (error) console.log("[KB] Encountered error while attempting to connect to DELTA FERN", error);
	await chrome.contentScripts.register({
		runAt: "document_end",
		matches: [
			"https://*.kogama.com/*",
			"https://kogama.com.br/*"
		],
		excludeMatches: [
			"https://*.kogama.com/purchase/",
			"https://kogama.com.br/purchase/",
			"https://*.kogama.com/paymentwall/*",
			"https://kogama.com.br/paymentwall/*",
			"https://*.kogama.com/profile/*/edit/",
			"https://kogama.com.br/profile/*/edit/",
			"https://*.kogama.com/register/",
			"https://kogama.com.br/register/",
			"https://*.kogama.com/login/",
			"https://kogama.com.br/login/",
			"https://*.kogama.com/password-lost",
			"https://kogama.com.br/password-lost",
			"https://*.kogama.com/subscription/*",
			"https://kogama.com.br/subscription/*"
		],
		js: [{
			file: "general/betterchat.js"
		}, {
			file: "general/betterfriends.js"
		}]
	});
	console.log("[KB] Registered BetterChat and BetterFriends (Content)");
	document.body.append(
		createElement("script", {
			type: "text/javascript",
			src: chrome.runtime.getURL("background/chatnotifications.js")
		}),
		createElement("script", {
			type: "text/javascript",
			src: chrome.runtime.getURL("background/favoritefriends.js")
		})
	);
	console.log("[KB] Registered ChatNotifications and FavoriteFriends (Background)");
});
DeltaFern.onMessage.addListener(async event => {
	if (event.type === "FAVORITES_REQUEST") {
		const { server, clientID } = event.data;
		const favorites = await getStoredData(`${server}:${clientID}:favorite_friends`, []);
		DeltaFern.postMessage({
			type: "FAVORITES_RESPONSE",
			data: {
				favorites
			}
		});
	}
});