console.log("[KoGaMaBuddy] BetterFriends loaded");

const GAME_CACHE = new Map();
const getGameName = gameID => GAME_CACHE.get(gameID) || fetchJSON(`/game/${gameID}/published/`).then(res => res.data.name);
const getProjectName = projectID => GAME_CACHE.get(projectID) || fetchJSON(`/game/${projectID}/member/`).then(res => res.data[0].name);

//	Start!
const CES = document.getElementById("chat-extended-side");
Promise.all([
	getLocaleString(pageData.locale, "General:BetterFriends:FavoriteCategory"),
	waitForMutation(CES, { childList: true })
]).then(([FavoriteCategoryLocale]) => {
	const favoriteContainer = createFavoriteCategory(FavoriteCategoryLocale);
	const onlineHeader = CES.querySelector("._1Yhgq > header");
	onlineHeader.parentNode.insertBefore(favoriteContainer, onlineHeader);
});

async function updatePinnedFriends(event) {
	if (event.type !== "UPDATE_PINNED_FRIENDS") return;

	//	Resolve location names
	for (const button of document.querySelectorAll("button.WXeh0")) {
		try {
			if (!button.parentNode) continue;
			const parentNode = button.parentNode.parentNode.wrappedJSObject;
			// Retrieve user's current location
			const internalInstanceKey = Object.keys(parentNode).find(k => k.includes("InternalInstance"));
			if (!parentNode[internalInstanceKey]) continue;
			const currentLocation = parentNode[internalInstanceKey].return.memoizedProps.friend.location;
			// Retrieve gameID and projectID
			const [gameID, projectID] = currentLocation.match(/\d+/g) || [];
			if (currentLocation.includes("play")) {
				const gameName = await getGameName(gameID);
				parentNode.querySelector("span:nth-child(2)").innerText = decodeEntities(gameName);
				GAME_CACHE.set(gameID, gameName);
			} else if (currentLocation.includes("build")) {
				const projectName = await getProjectName(projectID);
				parentNode.querySelector("span:nth-child(2)").innerText = decodeEntities(projectName);
				GAME_CACHE.set(projectID, projectName);
			}
		} catch(error) {
			console.error("Encountered error while retrieving location details", error, button);
		}
	}

	//	Clear Favorite Friends List
	let pinnedList = document.querySelector(".pinned-friends > div");
	if (!pinnedList) {
		const favoriteCategoryLocale = await getLocaleString(pageData.locale, "General:BetterFriends:FavoriteCategory");
		const favoriteContainer = createFavoriteCategory(favoriteCategoryLocale);
		const onlineHeader = CES.querySelector("._1Yhgq > header");
		onlineHeader.parentNode.insertBefore(favoriteContainer, onlineHeader);
		pinnedList = document.querySelector(".pinned-friends > div");
	}
	while (pinnedList.lastChild) pinnedList.removeChild(pinnedList.lastChild);

	//	Make original cards visible again
	for (const hiddenCard of document.querySelectorAll(".kb-hidden")) {
		hiddenCard.classList.remove("kb-hidden");
	}

	// Display offline count
	const offlineHeader = CES.querySelector("div._1Yhgq > header:nth-of-type(2)");
	const offlineMembers = CES.querySelectorAll("div._1Yhgq > header:nth-of-type(2) ~ div._1lvYU");
	if (offlineHeader.lastChild.data.startsWith(" (")) {
		offlineHeader.lastChild.data = ` (${offlineMembers.length})`;
	} else {
		offlineHeader.appendChild(document.createTextNode(` (${offlineMembers.length})`));
	}

	//	Update pinned friends list
	pinnedList.previousSibling.firstElementChild.innerText = String(event.data.pinnedFriends.length);
	if (!event.data.pinnedFriends.length) return false;
	const friendsList = getFriendsList();
	for (const friendData of event.data.pinnedFriends) {
		const originalCard = friendsList.get(friendData.username);
		const favoriteCard = originalCard.cloneNode(true);
		const joinButton = favoriteCard.querySelector("button.WXeh0");

		originalCard.classList.add("kb-hidden");
		favoriteCard.childNodes[0].onclick = () => originalCard.childNodes[0].click();
		favoriteCard.childNodes[1].onclick = () => originalCard.childNodes[1].click();
		if (joinButton) {
			joinButton.onclick = () => originalCard.querySelector("button.WXeh0").click();
		}

		pinnedList.appendChild(favoriteCard);
	}

	return true;
}

//	Helper Functions
function getFriendsList() {
	return new Map(
		[...document.querySelectorAll("p._3zDi-")]
			.map(p => [ p.innerText, p.parentNode.parentNode ])
	);
}

function createFavoriteCategory(categoryLocale) {
	const container = document.createElement("DIV");
	const header = document.createElement("HEADER");
	const amount = document.createElement("SPAN");
	const listContainer = document.createElement("DIV");
	amount.appendChild(document.createTextNode("0"));
	header.append(categoryLocale, " (", amount, ")");
	container.classList.add("pinned-friends");
	container.append(header, listContainer);
	return container;
}

chrome.runtime.onMessage.addListener(updatePinnedFriends);