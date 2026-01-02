console.log("[KoGaMaBuddy] Initializing SessionMenu");

if (!location.search.includes("autoplay")) {
	// Currently supported locales
	const SUPPORTED_LOCALES = [ "en_US", "pt", "pt_BR", "fr_FR", "es_ES" ];

	// Create elements
	const AppRoot = createElement("div#delta-nak", [
		createElement("session-menu-button", {
			"v-bind:active": "isMenuOpen",
			"v-on:click": "toggleMenu"
		}),
		createElement("transition", {
			"name": "kb-popup"
		}, [
			createElement("session-menu", {
				"v-if": "isMenuOpen"
			})
		])
	]);
	const AppJSM = createElement("script", {
		type: "module",
		src: chrome.runtime.getURL("/content/game/SessionMenu/App.jsm")
	});

	// Retrieve clientID and page locale
	const NAKLocale = SUPPORTED_LOCALES.includes(pageData.locale) ? pageData.locale : "en_US";
	window.wrappedJSObject.KB_NAK_CLIENT_ID = clientID;
	window.wrappedJSObject.KB_NAK_LOCALE = NAKLocale;

	// Append elements
	try {
		document.getElementById("unity").parentNode.prepend(AppRoot)
	} catch(e) {
		document.getElementById("game-play").prepend(AppRoot);
	}
	document.body.appendChild(AppJSM);

	// Add event handlers to destroy instance
	window.addEventListener("unload", () => {
		const App = window.wrappedJSObject.KB_NAK_APP;
		App.$destroy && App.$destroy();
	});
  document.getElementById("game-play").addEventListener("click", event => {
		if (event.target.id === "webgl-play") {
			const App = window.wrappedJSObject.KB_NAK_APP;
			App.$destroy && App.$destroy();
			App.$el && App.$el.remove();
		} else if (event.target.classList.contains("kb-sm-icon")) {
			const App = window.wrappedJSObject.KB_NAK_APP;
			if (typeof App !== "undefined" && document.querySelector("#unity iframe") !== null) {
				App.$destroy && App.$destroy();
				App.$el && App.$el.remove();
			}
		}
	});
}