const FRIEND_CHAT_PATTERNS = [
	"https://*.kogama.com/user/*/friend/chat/",
	"https://kogama.com.br/user/*/friend/chat/",
	"https://*.kogama.com/user/*/friend/chat/?full=1",
	"https://kogama.com.br/user/*/friend/chat/?full=1"
];

const isOnline = user => Date.now() - new Date(user.last_ping).getTime() < 300000;

function getFavoriteFriends(details) {
	const server = getServerFromURL(details.url);
	const clientID = getClientID(details.url);
	Promise.all([
		awaitFilter(details.requestId, true),
		getStoredData(`${server}:${clientID}:favorite_friends`, [])
	]).then(([ filter, favoriteFriends ]) => {
		const responseData = filter.getJSON();
		const pinnedFriends = responseData.data.filter(user => favoriteFriends.includes(user.profile_id) && isOnline(user));
		chrome.tabs.sendMessage(details.tabId, {
			type: "UPDATE_PINNED_FRIENDS",
			data: { pinnedFriends }
		});
	});
}

chrome.webRequest.onBeforeSendHeaders.addListener(
	getFavoriteFriends,
	{ urls: FRIEND_CHAT_PATTERNS, types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);