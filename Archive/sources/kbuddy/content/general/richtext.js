console.log("[KoGaMaBuddy] RichText loaded");

const ITEM_PATTERN = /(?:https:\/\/)?((?:(?:www|friends)\.)?kogama.com(?:\.br)?)\/marketplace\/(?:model|avatar)\/([ai]-\d+)\/?/;
const GAME_PATTERN = /(?:https:\/\/)?((?:(?:www|friends)\.)?kogama.com(?:\.br)?)\/games\/(?:play|embed)\/(\d+)\/?/;
const USER_PATTERN = /(?:https:\/\/)?((?:(?:www|friends)\.)?kogama.com(?:\.br)?)\/profile\/(\d+)(?:$|\/(?:(.*)\/)?)/;
// Old Markdown patterns; now being deprecated
const CODE_BLOCK_PATTERN = /```(\w*?)\n([\s\S]+?)\n```/gm;
const QUOTE_BLOCK_PATTERN = /^> ([^$]+?)$/gm;
const MARKDOWN_PATTERN = /(\*{1,3}|~~|__|\|\||`)((?:\S|\S.*?\S))\1/g;
const URL_PATTERN = /https?:\/\/((?:[\w-]+|\.(?=\w+))+\.\w+)([\w\/_-]+(?:\.\w+)?)?(\?\w+=\w+(?:&\w+=\w+)*)?/g;
const EMOTE_PATTERN = /:(\w+)(:?)/g;
// New Markdown patterns; hopefully more accurate
const MARKDOWN = {
	CODE_BLOCK: /`{3}(?:(\w+?)(?=\n))?([\s\S]*?)`{3}/gm,
	QUOTE_BLOCK: /^(?:> [^\n]*(?:\n|$))+/gm,
	CODE_SPAN: /(``?)(.+?)\1/g,
	BOLD: /\*\*(.+?\**)\*\*/g,
	ITALIC: /\*(?=\S)(.*?\S+?)\*/g,
	UNDERLINE: /__(.+?_*)__/g,
	STRIKETHROUGH: /~~(.+?~*)~~/g,
	SPOILER: /\|\|(.+?)\|\|/g,
	EMOTE: /:(\w+)(:?)/g
};
// \*(?=\S)(\S|.+?\S)\*

const isValidLink = node => node.parentNode.tagName === "A" && (ITEM_PATTERN.test(node.data) || GAME_PATTERN.test(node.data) || USER_PATTERN.test(node.data));

const USER_PAGE_MAP = {
	"games"              : "General:RichText:UserGames",
	"avatars"            : "General:RichText:UserAvatars",
	"badges"             : "General:RichText:UserBadges",
	"leaderboard"        : "General:RichText:UserRanking",
	"friends"            : "General:RichText:UserFriends",
	"friends/shared"     : "General:RichText:UserSharedFriends",
	"marketplace"        : "General:RichText:UserAvatarMarketplace",
	"marketplace/model"  : "General:RichText:UserModelMarketplace",
	"marketplace/avatar" : "General:RichText:UserAvatarMarketplace"
};

const TAG_BLACKLIST = [
	"textarea",
	"script",
	"input",
	"style",
	"code"
];

const CLASS_BLACKLIST = {
	ELEMENT: [
		"_3zDi-",			// Friends List Card: Username
		"_4RanE",			// Friends List Header
		"user",				// Feed Post Title
		"tool-tip",			// Profile Header
		"username",			// Notifications Tab
	],
	PARENT: [
		"username",			// Comment Author
		"product-creator"	// Product Creator
	]
};

const KOGAMA_EMOTE_MAP = new Map(
	JSON.parse(sessionStorage.getItem("kb-kogama-emotes"))
);

const VALID_EMOTES = [
	"block_happy",
	"block_stylin",
	"sword_sad",
	"sword_smirk",
	"sword_yatta",
	"haha",
	"haah",
	"soi_smug",
	"junko_shook",
];

// Safe, KoGaMa-related websites
const VALID_HOSTNAMES = [
	"www.kogama.com",
	"friends.kogama.com",
	"kogama.com.br",
	"www.support.kogama.com",
	"kogama.freeforums.net",
	"kogama.gamepedia.com",
	"multiverseblog.weebly.com",
	"multiverseaps.com"
];

// Non-KoGaMa-related websites: must be filtered
const VALID_PATHNAMES = [
	"https://twitter.com/KOGAMAGAME",
	"https://www.facebook.com/Kogamians/",
	"https://www.instagram.com/kogama_official/",
	"https://www.linkedin.com/company/multiverse-aps/",
	"https://www.youtube.com/user/KoGaMagamemaker",
	"https://discord.com/invite/kogama",
	"https://discordapp.com/invite/kogama",
	"https://discord.gg/kogama",
	"https://discord.gg/2P3jZd5",
	"https://discord.gg/D9JAg2FAka"
].reduce((entries, url) => {
	const [, hostname, pathname ] = URL_PATTERN.exec(url.replace(/\/$/, "/."));
	if (hostname in entries) {
		entries[hostname].push(pathname);
	} else {
		entries[hostname] = [ pathname ];
	}
	// When *isn't* it a RegEx issue?
	URL_PATTERN.lastIndex = 0;
	return entries;
}, {});

const MARKDOWN_HANDLERS = {
	"***": createBoldItalics,
	"**" : createElementWrapper("B"),
	"*"  : createElementWrapper("I"),
	"~~" : createElementWrapper("S"),
	"__" : createElementWrapper("U"),
	"||" : createSpoilerTag,
	"`"  : createElementWrapper("CODE")
};

const STATIC_NODES = {
	"/profile/": "#description-extend .text",
	"/games/play/": "#game-description",
	"/marketplace/model/": "#product-detail .product-description",
	"/build/": "#project-edit .desc"
};


//	Helper Functions
function isBlacklisted(element) {
	return CLASS_BLACKLIST.ELEMENT.some(c => element.classList.contains(c))
		|| CLASS_BLACKLIST.PARENT.some(c => element.parentNode.classList.contains(c))
		|| TAG_BLACKLIST.includes(element.tagName.toLowerCase());
}

function createElementWrapper(tag) {
	return content => {
		const container = document.createElement(tag);
		container.appendChild(document.createTextNode(content));
		return container;
	}
}

function createBoldItalics(content) {
	const boldContainer = document.createElement("B");
	const italicContainer = document.createElement("I");
	italicContainer.appendChild(document.createTextNode(content));
	boldContainer.appendChild(italicContainer);
	return boldContainer;
}

function createSpoilerTag(content) {
	const span = document.createElement("span");
	span.appendChild(document.createTextNode(content));
	span.classList.add("spoiler");
	span.addEventListener("click", function() {
		this.classList.remove("spoiler");
	}, { once: true });
	return span;
}

function createKoGaMote(name) {
	const span = document.createElement("span");
	span.classList.add("kogamote");
	span.title = name;
	span.style.backgroundImage = `url(${chrome.runtime.getURL("resources/emotes")}/${name}.png)`;
	return span;
}

function createEmote(emote) {
	return createElement("span.emote-img-container", [
		createElement("img.emote-img", {
			"data-codename": emote.codename,
			src: emote.image,
			width: "23",
			height: "23"
		})
	]);
}

function createCodeBlock(content, langCode) {
	const preContainer = document.createElement("PRE");
	const codeContainer = document.createElement("CODE");
	codeContainer.appendChild(document.createTextNode(content.trim()));
	preContainer.appendChild(codeContainer);
	if (langCode) preContainer.title = langCode;
	return preContainer;
}

function createBlockquote(content) {
	const blockquoteContainer = document.createElement("blockquote");
	blockquoteContainer.classList.add("quote");
	blockquoteContainer.appendChild(document.createTextNode(content));
	return blockquoteContainer;
}

function createAnchor(href, text) {
	const anchorContainer = document.createElement("a");
	anchorContainer.href = href;
	anchorContainer.classList.add("kb-rt-link");
	anchorContainer.appendChild(document.createTextNode(text || href));
	return anchorContainer;
}

//	Text Node Handlers
async function processLinks(node) {
	if (!!node.data.match(ITEM_PATTERN)) {
		const [, origin, itemID] = ITEM_PATTERN.exec(node.data);
		const response = await fetch(`https://${origin}/model/market/${itemID}/`);
		if (response.status === 404) {
			node.data = await getLocaleString(pageData.locale, "General:RichText:ItemRemoved");
			node.parentNode.classList.add("kb-rt-item");
		} else {
			const { data: item } = await response.json();
			const itemLocaleKey = item.category === "model" ? "General:RichText:ModelCreator" : "General:RichText:AvatarCreator";
			const itemCreator = await getLocaleString(pageData.locale, itemLocaleKey);
			node.data = decodeEntities(item.name);
			node.parentNode.setAttribute("title", itemCreator.replace("{{creator}}", item.creator));
			node.parentNode.classList.add("kb-rt-item");
		}
	} else if (!!node.data.match(GAME_PATTERN)) {
		const [, origin, gameID] = GAME_PATTERN.exec(node.data);
		const response = await fetch(`https://${origin}/game/published/?q=${gameID}`);
		if (response.status === 404) {
			node.data = await getLocaleString(pageData.locale, "General:RichText:GameRemoved");
		} else {
			const game = await response.json();
			const description = game.description.trim().length
				? game.description.split('\n')[0].substring(0, 30)
				: await getLocaleString(pageData.locale, "General:RichText:DescriptionUnavailable");
			node.data = decodeEntities(game.name);
			node.parentNode.setAttribute("title", decodeEntities(description));
			node.parentNode.classList.add("kb-rt-game");
		}
	} else if (!!node.data.match(USER_PATTERN)) {
		const [, origin, userID, page] = USER_PATTERN.exec(node.data);
		let userData;
		try {
			const {data} = await fetchJSON(`https://${origin}/user/?q=${userID}`);
			userData = data[0];
		} catch(e) {
			const response = await fetch(`https://${origin}/profile/${userID}/`);
			if (response.status === 404) {
				node.data = await getLocaleString(pageData.locale, "General:RichText:UserRemoved");
				return;
			} else {
				const body = await response.text();
				userData = parsePageData(body).object;
			}
		}
		const pageLocale = !!page && page in USER_PAGE_MAP
			? await getLocaleString(pageData.locale, USER_PAGE_MAP[page])
			: userData.username;
		node.data = pageLocale.replace("{{user}}", userData.username);
		node.parentNode.classList.add("kb-rt-user");
	}
}

function processContent(node) {
	if (!node.parentNode || isBlacklisted(node.parentNode)) return;

	if (CODE_BLOCK_PATTERN.test(node.data)) {
		return processNode(node, CODE_BLOCK_PATTERN, ([, langCode, content ]) => {
			return createCodeBlock(content, langCode);
		});
	}

	if (QUOTE_BLOCK_PATTERN.test(node.data) && node.parentNode.tagName !== "BLOCKQUOTE") {
		return processNode(node, QUOTE_BLOCK_PATTERN, ([, content ]) => {
			return createBlockquote(content);
		});
	}

	if (URL_PATTERN.test(node.data) && node.parentNode.tagName !== "A") {
		return processNode(node, URL_PATTERN, ([ href, hostname, pathname ]) => {
			return (
				VALID_HOSTNAMES.includes(hostname)
				|| (hostname in VALID_PATHNAMES && VALID_PATHNAMES[hostname].includes(pathname))
			) ? createAnchor(href) : null;
		});
	}

	if (MARKDOWN_PATTERN.test(node.data)) {
		return processNode(node, MARKDOWN_PATTERN, ([, contentType, content ]) => {
			return MARKDOWN_HANDLERS[contentType](content);
		});
	}

	if (EMOTE_PATTERN.test(node.data)) {
		return processNode(node, EMOTE_PATTERN, ([, emoteName, emoteStyle ]) => {
			const isKoGaMote = emoteStyle === ':';
			if (isKoGaMote && VALID_EMOTES.includes(emoteName)) {
				return createKoGaMote(emoteName);
			} else if (!isKoGaMote && KOGAMA_EMOTE_MAP.has(emoteName)) {
				const emote = KOGAMA_EMOTE_MAP.get(emoteName);
				return createEmote(emote);
			}
			return null;
		});
	}
}

function processNode(node, pattern, matchHandlerFn) {
	const parsedElements = [];
	let lastIndex = pattern.lastIndex = 0;

	for (const match of matchAll(node.data, pattern)) {
		const processedContent = matchHandlerFn(match);
		if (!(processedContent instanceof HTMLElement)) continue;
		
		const previousText = node.data.slice(lastIndex, match.index);
		if (previousText) {
			parsedElements.push(document.createTextNode(previousText));
		}

		parsedElements.push(processedContent);
		lastIndex = match.index + match[0].length;
	}

	if (parsedElements.length) {
		const endText = node.data.slice(lastIndex);
		if (endText) {
			parsedElements.push(document.createTextNode(endText));
		}

		for (const element of parsedElements) {
			node.parentNode.insertBefore(element, node);
		}

		node.parentNode.removeChild(node);
	}
}

const pageObserver = new MutationObserver(mutations => {
	let textNode;
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			const iter = document.createNodeIterator(addedNode, NodeFilter.SHOW_TEXT);
			while (textNode = iter.nextNode()) {
				if (isValidLink(textNode)) processLinks(textNode);
				else processContent(textNode);
			}
		}
	}
});

const processContentElement = selector => {
	let textNode;
	const node = document.querySelector(selector);
	if (!node) return;
	const iter = document.createNodeIterator(node, NodeFilter.SHOW_TEXT);
	while (textNode = iter.nextNode()) processContent(textNode);
};

pageObserver.observe(document.body, {
	childList: true,
	subtree: true
});

for (const path of Object.keys(STATIC_NODES)) {
	if (!location.pathname.startsWith(path)) continue;
	processContentElement(STATIC_NODES[path]);
	break;
}

if (KOGAMA_EMOTE_MAP.size === 0 && clientID !== 0) {
	fetchJSON(`/api/emote/${clientID}/`).then(res => {
		for (const emote of res.data) {
			KOGAMA_EMOTE_MAP.set(emote.codename.slice(1), {
				codename: emote.codename,
				image: emote.images.medium
			});
		}
		sessionStorage.setItem("kb-kogama-emotes", JSON.stringify([...KOGAMA_EMOTE_MAP.entries()]));
	});
}