console.log("[KoGaMaBuddy] ItemCount loaded");

const MARKETPLACE_PATHS = [
	"/avatar/",
	"/avatar-popular/",
	"/avatar-likes/",
	"/model/",
	"/model-popular/",
	"/model-likes/",
	"/search/"
];
const PROFILE_PATHS = [
	"/games/",
	"/avatars/",
	"/marketplace/",
	"/marketplace/model/",
	"/marketplace/avatar/",
	"/badges/"
];
const GAME_PATHS = [
	"/playing/",
	"/featured/",
	"/new/",
	"/calendar-weekly/",
	"/likes/",
	"/search/",
	"/members/"
];
const BUILD_PATHS = [
	"/avatars/"
];

const validMarketplaceLink = pathname => pathname.startsWith("/marketplace/") && MARKETPLACE_PATHS.some(path => pathname.endsWith(path));
const validProfileLink = pathname => pathname.startsWith("/profile/") && PROFILE_PATHS.some(path => pathname.endsWith(path));
const validGameLink = pathname => pathname === "/games/" || (pathname.startsWith("/games/") && GAME_PATHS.some(path => pathname.endsWith(path)));
const validBuildLink = pathname => pathname.startsWith("/build/") && BUILD_PATHS.some(path => pathname.endsWith(path));

function createCountLink(label) {
	const linkContainer = document.createElement("A");
	const params = new URLSearchParams(location.search);
	if (params.get("count").toString() === label) {
		const strongContainer = document.createElement("STRONG");
		strongContainer.appendChild(document.createTextNode(label));
		linkContainer.appendChild(strongContainer);
	} else {
		linkContainer.appendChild(document.createTextNode(label));
	}
	const totalItems = Math.max(Number(params.get("page")) - 1, 1) * Number(params.get("count"));
	const page = params.get("page") === "1" ? "1" : Math.floor(totalItems / Number(label)) + 1;
	params.set("page", page);
	params.set("count", label);
	linkContainer.setAttribute("href", `${location.pathname}?${params.toString()}`);
	linkContainer.addEventListener("click", () => setStoredData(`${server}:${clientID}:item_count`, label));
	return linkContainer;
}

if (
	validMarketplaceLink(location.pathname)
	|| validProfileLink(location.pathname)
	|| validGameLink(location.pathname)
	|| validBuildLink(location.pathname)
) {
	const submenu = document.querySelector("div.submenu-container");
	getLocaleString(pageData.locale, "General:ItemCount:ItemsPerPage").then(itemCountLabel => {
		// Create containers
		const itemMenuContainer = document.createElement("DIV");
		itemMenuContainer.classList.add("item-count-container");
		const labelContainer = document.createElement("SPAN");
		labelContainer.appendChild(document.createTextNode(itemCountLabel));
		// Append container and links
		itemMenuContainer.appendChild(labelContainer);
		itemMenuContainer.appendChild(createCountLink("12"));
		itemMenuContainer.appendChild(createCountLink("24"));
		itemMenuContainer.appendChild(createCountLink("36"));
		itemMenuContainer.appendChild(createCountLink("48"));
		itemMenuContainer.appendChild(createCountLink("60"));
		// Append to submenu
		submenu.appendChild(itemMenuContainer);
	});
}