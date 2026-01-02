const NOTIFICATION_PATTERN = "https://*.kgoma.com/v1/notify/c/*";

const NOTIF_KEY_MAP = Object.freeze({
	TYPE: {
		"friend-relation-updated"  : "Background:DesktopNotifications:FriendRequestTitle",
		"project-relation-updated" : "Background:DesktopNotifications:ProjectInviteTitle",
		"product-sold"             : "Background:DesktopNotifications:ProductSoldTitle"
	},
	MESSAGE: {
		"friend-relation-updated"  : "Background:DesktopNotifications:FriendRequest",
		"project-relation-updated" : "Background:DesktopNotifications:ProjectInvite",
		"avatar-sold"              : "Background:DesktopNotifications:AvatarSold",
		"model-sold"               : "Background:DesktopNotifications:ModelSold"
	}
});
const NOTIF_URL = Object.freeze({
	"friend-relation-updated"  : n => `/profile/${n.profile_id}/`,
	"project-relation-updated" : n => `/build/${getClientID(n.profile_images.small)}/project/invitations/`,
	"product-sold"             : n => `/marketplace/${n.product_id[0] === "a" ? "avatar" : "model"}/${n.product_id}/`
});
let latestTime = Date.now();

async function getNotifications(details) {
	//	Retrieve user status
	const server = getServerFromURL(details.url);
	const clientID = getClientID(server);
	const status = await getStoredData(`${server}:${clientID}:status`, "ONLINE");
	//	Ignore site or extension retrieving generation number or statistics; ignore when using DND
	if (status === "DND" || details.url.includes("generation=0")) return;
	const filter = chrome.webRequest.filterResponseData(details.requestId);
	let data = "";
	filter.ondata = event => {
		filter.write(event.data);
		data += textDecoder.decode(event.data, { stream: true });
	};
	filter.onstop = async () => {
		filter.disconnect();
		if (!data.length) return;
		const parsed = JSON.parse(data);
		const cookie = details.requestHeaders.find(h => h.name.toLowerCase() === "cookie");
		const locale = /language=(\w+);/.exec(cookie && cookie.value || "language=en_US;")[1];
		//	Iterate through notifications in reverse order (newest to oldest)
		for (const baseNotification of (parsed.log || []).reverse()) {
			const notifTime = new Date(baseNotification.time).getTime();
			//	Ignore older notifications
			if (notifTime <= latestTime) break;
			//	Set timestamp for latest notification
			latestTime = notifTime;
			
			const notifData = JSON.parse(baseNotification.data);
			
			//	Automatically reject friend requests from blocked users
			if (baseNotification.type === "friend-relation-updated") {
				const blockedUsers = await getStoredData(`${server}:${clientID}:blocked_users`, []);
				if (blockedUsers.includes(notifData.profile_id)) {
					return fetch(`${new URL(details.originUrl).origin}/user/${clientID}/friend/${notifData.profile_id}/`, {
						method: "DELETE"
					});
				}
			}
			//	Display notification
			const [ notifType, notifMessage ] = await getNotificationStrings(locale, baseNotification.type, notifData);
			chrome.tabs.sendMessage(details.tabId, { type: "NOTIF_SOUND", data: { subtype: "DESKTOP" } });
			Notifications.create(Math.floor(latestTime / 6905).toString(), {
				title: `[KoGaMa ${getServerFromURL(details.originUrl).toUpperCase()}] ${notifType}`,
				content: notifMessage,
				icon: "https:" + notifData.profile_images.medium,
				handler: "desktop",
				url: new URL(details.originUrl).origin + NOTIF_URL[baseNotification.type](notifData)
			});
		}
	};
}

async function getNotificationStrings(locale, type, data) {
	const messageKey = type === "product-sold"
		? data.product_id[0] === "a" ? "avatar-sold" : "model-sold"
		: type;
	const [ notifType, notifMessage ] = await getLocaleStrings(locale, [
		NOTIF_KEY_MAP.TYPE[type], NOTIF_KEY_MAP.MESSAGE[messageKey]
	]);
	return [
		notifType,
		notifMessage.replace("{{user}}", data.profile_username).replace("{{item}}", data.product_name)
	];
}

async function desktopNotifClicked(notifData) {
	const { windowId } = await chrome.tabs.create({
		active: true,
		url: notifData.url
	});
	await chrome.windows.update(windowId, {
		focused: true
	});
	return true;
}

Notifications.registerHandler("desktop", desktopNotifClicked);

chrome.webRequest.onBeforeSendHeaders.addListener(
	getNotifications,
	{ urls: [ NOTIFICATION_PATTERN ], types: [ "xmlhttprequest" ] },
	[ "blocking", "requestHeaders" ]
);