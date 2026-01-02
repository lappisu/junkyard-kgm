const CHAT_PATTERN = [
	"https://*.kogama.com/chat/*/",
	"https://kogama.com.br/chat/*/"
];

// Welcome to the National Security Agency.
async function interceptChat(details) {
	//	Retrieve status
	const server = getServerFromURL(details.url);
	const clientID = getClientID(server);
	const status = await getStoredData(`${server}:${clientID}:status`, "ONLINE");
	//	Ignore data creation methods and chat history requests; ignore if using DND
	if (status === "DND" || details.method !== "GET" || details.url.includes("history")) return;
	//	Create filter to read data
	const filter = chrome.webRequest.filterResponseData(details.requestId);
	let data = "";
	//	No changes will be made to the data so it will be sent back
	filter.ondata = event => {
		filter.write(event.data);
		data += textDecoder.decode(event.data, { stream: true });
	}
	filter.onstop = async () => {
		//	No changes will be made; disconnect filter
		filter.disconnect();
		//	Check if the tab is focused and retrieve tab's current locale
		const isFocused = await chrome.tabs.sendMessage(details.tabId,{type:"CHECK_TAB_FOCUS"});
		//	Return early if tab is in focus; no notification is needed
		if (isFocused) return;
		//	Data may be incomplete and must be ignored
		if (data.length < 3) return;
		const parsed = JSON.parse(data);
		//	Iterate over friends
		for (const friendID of Object.keys(parsed.data)) {
			const friendData = await fetch(`${new URL(details.url).origin}/user/?q=${friendID}`).then(r => r.json());
			//	Iterate through each message
			for (const message of parsed.data[friendID]) {
				chrome.tabs.sendMessage(details.tabId, { type:"NOTIF_SOUND", data: { subtype: "CHAT" } });
				Notifications.create(message.id.toString(), {
					title: `${message.from_username} (${getServerFromURL(details.url).toUpperCase()})`,
					content: decodeEntities(message.message.trim()),
					icon: "https:" + friendData.data[0].friend_images.medium,
					tabID: details.tabId,
					username: message.from_username,
					handler: "chat"
				});
			}
		}
	};
}

async function chatNotifClicked(notifData) {
	const { tabID, username } = notifData;
	if (!tabID) return false;
	const { windowId } = await chrome.tabs.update(tabID, { active: true });
	await chrome.windows.update(windowId, { focused: true });
	await chrome.tabs.sendMessage(tabID, {
		type: "CHAT_FOCUS",
		data: { username }
	});
	return true;
}

Notifications.registerHandler("chat", chatNotifClicked);

chrome.webRequest.onBeforeRequest.addListener(
	interceptChat,
	{ urls: CHAT_PATTERN, types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);