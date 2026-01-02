const ITEM_COUNT_PAGES = [
	"https://*.kogama.com/marketplace/search/*",
	"https://*.kogama.com/marketplace/*/",
	"https://*.kogama.com/profile/*/*/",
	"https://*.kogama.com/build/*/*/",
	"https://*.kogama.com/games/*/",
	"https://*.kogama.com/games/",
	"https://kogama.com.br/marketplace/search/*",
	"https://kogama.com.br/marketplace/*/",
	"https://kogama.com.br/profile/*/*/",
	"https://kogama.com.br/build/*/*/",
	"https://kogama.com.br/games/*/",
	"https://kogama.com.br/games/"
];

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

const validMarketplaceLink = pathname => MARKETPLACE_PATHS.some(path => pathname.endsWith("marketplace" + path));
const validProfileLink = pathname => pathname.startsWith("/profile/") && PROFILE_PATHS.some(path => pathname.endsWith(path));
const validGameLink = pathname => pathname === "/games/" || (pathname.startsWith("/games/") && GAME_PATHS.some(path => pathname.endsWith(path)));
const validBuildLink = pathname => pathname.startsWith("/build/") && BUILD_PATHS.some(path => pathname.endsWith(path));

async function moreItems(details) {
	const url = new URL(details.url);
	if (
		!validMarketplaceLink(url.pathname)
		&& !validProfileLink(url.pathname)
		&& !validGameLink(url.pathname)
		&& !validBuildLink(url.pathname)
	) return;
	if (url.searchParams.has("count")) return;
	if (url.pathname === "/marketplace/search/" && !url.searchParams.has("q")) return;
	const server = getServerFromURL(details.url);
	const clientID = getClientID(server);
	const count = await getStoredData(`${server}:${clientID}:item_count`, "12");
	if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
	url.searchParams.set("count", count.toString());
	return { redirectUrl: url.href };
}

chrome.webRequest.onBeforeRequest.addListener(
	moreItems,
	{ urls: ITEM_COUNT_PAGES },
	[ "blocking" ]
);