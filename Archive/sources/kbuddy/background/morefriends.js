const FRIENDS_PAGE_PATTERNS = [
	"https://*.kogama.com/profile/*/friends/",
	"https://kogama.com.br/profile/*/friends/"
];

async function getRemainingFriends(originURL, profileID) {
	const friendsURL = `${originURL}/user/${profileID}/friend/?page=2&count=300`;
	const friendsResponse = await fetchJSON(friendsURL);
	let friends = friendsResponse.data;
	for (const pagingLink of friendsResponse.paging.paging_links.slice(2)) {
		const pagingResponse = await fetchJSON(originURL + pagingLink.url);
		friends = [
			...friends,
			...pagingResponse.data
		];
	}
	return friends;
}

function friendsPageListener(details) {
	const clientID = getClientID(details.url);
	const profileID = parseNumber(details.url);
	if (clientID < 1 || clientID !== profileID) return;
	Promise.all([
		awaitFilter(details.requestId),
		getRemainingFriends(new URL(details.url).origin, clientID)
	]).then(([ filter, friends ]) => {
		if (friends.length === 0) {
			filter.data.forEach(buffer => filter.write(buffer));
		} else {
			let body = filter.getText();
			try {
				const firstIndex = body.indexOf("options.bootstrap = {") + 20;
				const lastIndex = body.indexOf("};", firstIndex) + 1;
				const pageData = JSON.parse(body.substring(firstIndex, lastIndex));
				pageData.friends = [
					...pageData.friends,
					...friends
				];
				body = body.substring(0, firstIndex) + JSON.stringify(pageData) + body.substring(lastIndex);
			} catch(_) {}
			filter.writeText(body);
		}
		filter.disconnect();
	});
}

chrome.webRequest.onBeforeRequest.addListener(
	friendsPageListener,
	{ urls: FRIENDS_PAGE_PATTERNS },
	[ "blocking" ]
);