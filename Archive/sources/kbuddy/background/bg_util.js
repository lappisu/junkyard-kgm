// Class instances for use across various features
const textDecoder = new TextDecoder("UTF-8");
const textEncoder = new TextEncoder();
const domParser = new DOMParser();

//	Server URLs for easy use
const SERVER_URLS = {
	www: "https://www.kogama.com",
	friends: "https://friends.kogama.com",
	br: "https://kogama.com.br"
}

//	Stores the clientIDs for each server
const CLIENT_IDS = {
	www: 0,
	friends: 0,
	br: 0
};

//	Stores the user's prefered client
const KOGAMA_CLIENTS = {
	www: "WEBGL",
	friends: "WEBGL",
	br: "WEBGL"
};

//	getServerFromURL: Accepts URL string or Request Details object; Returns server name
const getServerFromURL = url => /br|www|friends/.exec(url.url||url)[0];
//	getClientID: Accepts URL string or Request Details object; Returns ClientID for server
const getClientID = url => CLIENT_IDS[getServerFromURL(url.url||url)];
//	getServerURL: 
const getServerURL = server => SERVER_URLS[server.toLowerCase()];
//	getNumber: Retrieve integer in a given string
const parseNumber = str => parseInt(str.match(/\d+/)[0], 10);

// awaitFilter: Promisify chrome.webRequest.filterResponseData
function awaitFilter(requestID, passive = false) {
	return new Promise((fulfill, reject) => {
		const filter = chrome.webRequest.filterResponseData(requestID);
		filter.onstart = () => filter.data = [];
		filter.ondata = ({ data }) => {
			if (passive) filter.write(data);
			filter.data.push(data);
		};
		filter.onstop = () => {
			if (passive) filter.disconnect();
			fulfill(filter);
		};
		filter.onerror = () => {
			if (passive) filter.close();
			reject(filter);
		};
		filter.getText = () => filter.data.reduce((str, data) => str += textDecoder.decode(data, { stream: true }), "");
		filter.getJSON = () => JSON.parse(filter.getText());
		filter.writeText = data => filter.write(textEncoder.encode(data));
		filter.writeJSON = data => filter.writeText(JSON.stringify(data));
	});
}

//	parsePageData: Accepts page body as string; Returns object with data from options.bootstrap
function parsePageData(body) {
	const firstIndex = body.indexOf("options.bootstrap = {") + 20;
	const lastIndex = body.indexOf("};", firstIndex) + 1;
	const data = body.substring(firstIndex, lastIndex);
	return JSON.parse(data);
}

// Create custom KoGaMa pages using an already existing one as a base
function createPage(pageURL, template, rejectFilter, process) {
	const PAGE_PATTERNS = [
		"https://*.kogama.com" + pageURL,
		"https://kogama.com.br" + pageURL
	];
	
	async function pageListener(details) {
		// Check if the page can be loaded and what to do if not
		let reject = rejectFilter(details);
		if (typeof reject === "string") {
			if (reject === "cancel") return { cancel: true };
			if (pageURL.includes("*")) {
				const pagePattern = new RegExp(pageURL.replace(/\*/g,"(\\w+)"));
				for (const match of (pagePattern.exec(details.url) || []).slice(1)) {
					reject = reject.replace("*", match);
				}
			}
			return { redirectUrl: new URL(details.url).origin + reject };
		}
		
		// Get URL of page being used as template
		let templateURL = template;
		if (typeof template === "string" && pageURL.includes("*")) {
			const pagePattern = new RegExp(pageURL.replace(/\*/g,"(\\w+)"));
			for (const match of (pagePattern.exec(details.url) || []).slice(1)) {
				templateURL = templateURL.replace("*", match);
			}
		} else if (typeof template === "function") {
			templateURL = template(details);
		}

		// Retrieve template page and allow user to modify before serving it
		const body = await fetch(new URL(details.url).origin + templateURL).then(r => r.text());
		const filter = chrome.webRequest.filterResponseData(details.requestId);
		filter.onstop = async () => {
			const resp = await process(body, details);
			filter.write(textEncoder.encode(resp));
			filter.disconnect();
		};
	}

	chrome.webRequest.onBeforeRequest.addListener(
		pageListener,
		{ urls: PAGE_PATTERNS },
		[ "blocking" ]
	);
}


function getStoredData(key, fallback="") {
	return chrome.storage.local.get({
		[key]: fallback
	}).then(docs => docs[key]);
}

const fetchJSON = (...args) => fetch(...args).then(res => res.json());

function createHTMLTemplate(htmlString) {
	const parser = new DOMParser();
	return (opts) => {
		const builtString = htmlString.replace(/{{(\w+)}}/g, (_, prop) => opts[prop]);
		const builtDOM = parser.parseFromString(builtString, "text/html");
		return builtDOM.body.childNodes[0];
	};
}

function decodeEntities(str) {
	const builtDOM = domParser.parseFromString(`<!DOCTYPE html><html><body>${str}</body></html>`, "text/html");
	return builtDOM.body.textContent;
}

/* Notification Handling */
const Notifications = Object.freeze({
	NOTIFICATION_HANDLERS: new Map(),
	ACTIVE_NOTIFICATIONS: new Map(),
	create(notifID, notifData) {
		this.ACTIVE_NOTIFICATIONS.set(notifID, notifData);
		return chrome.notifications.create(notifID, {
			type: "basic",
			title: notifData.title,
			message: notifData.content,
			iconUrl: notifData.icon
		});
	},
	registerHandler(handleName, handleFn) {
		return this.NOTIFICATION_HANDLERS.set(handleName, handleFn);
	},
	_notificationClicked(notifID) {
		const notifData = this.ACTIVE_NOTIFICATIONS.get(notifID);
		const handler = this.NOTIFICATION_HANDLERS.get(notifData.handler)
		return handler && handler(notifData);
	},
	_notificationClosed(notifID) {
		return this.ACTIVE_NOTIFICATIONS.delete(notifID);
	}
});
chrome.notifications.onClicked.addListener(Notifications._notificationClicked.bind(Notifications));
chrome.notifications.onClosed.addListener(Notifications._notificationClosed.bind(Notifications));

/**
 * Agatha's createElement function - inspired by React's createElement(), Vue's h(), and Hyperscript's h()
 * Simple implementation, minimal error checking
 * > createElement(tag: string, attributes?: object, children?: Array<HTMLElement>|string): HTMLElement
 */
const createElement = (tag, ...args) => {
	const [tagName, ...tagAttributeMatches] = tag.split(/(?=[\.#])/);
	const element = document.createElement(tagName);
	const tagAttributes = tagAttributeMatches.reduce((object, value) => {
		if (value[0] === ".") {
			if (!object.class) object.class = value.slice(1);
			else object.class += value.replace(".", " ");
		} else object.id = value.slice(1);
		return object;
	}, {});
	const argAttributes = (typeof args[0] === "object" && !Array.isArray(args[0]))
		? args.shift()
		: {};
	const children = (Array.isArray(args[0]) || typeof args[0] === "string")
		? args.shift()
		: [];
	const attributes = ({ ...tagAttributes, ...argAttributes });
	for (const name of Object.keys(attributes)) {
		if (name.startsWith("on")) {
			const event = name.slice(2).toLowerCase();
			const handler = attributes[name];
			element.addEventListener(event, handler.bind(element));
		} else {
			element.setAttribute(name, attributes[name]);
		}
	}
	typeof children === "string"
		? element.appendChild(document.createTextNode(children))
		: element.append(...children);
	return element;
};