const EMOTE_ENDPOINT_PATTERN = [
	"https://*.kogama.com/api/emote/*/",
	"https://kogama.com.br/api/emote/*/"
];

const KB_EMOTES = [
	"block_happy",
	"block_stylin",
	"sword_sad",
	"sword_smirk",
	"sword_yatta",
	"haha",
	"haah",
	"soi_smug",
	"junko_shook"
].map((emote, index) => ({
	id: 6905 + index,
	emote_set_id: 2,
	codename: `:${emote}:`,
	images: {
		medium: chrome.runtime.getURL(`/resources/emotes/${emote}.png`),
	},
	created: new Date().toISOString(),
	is_public: true
}));

function injectEmotes({ method, requestId }) {
	if (method !== "GET") return;
	awaitFilter(requestId).then(filter => {
		const emoteData = filter.getJSON();
		emoteData.data = [
			...KB_EMOTES,
			...emoteData.data
		];
		filter.writeJSON(emoteData);
		filter.close();
	});
}

chrome.webRequest.onBeforeRequest.addListener(
	injectEmotes,
	{ urls: EMOTE_ENDPOINT_PATTERN, types: [ "xmlhttprequest" ] },
	[ "blocking" ]
);