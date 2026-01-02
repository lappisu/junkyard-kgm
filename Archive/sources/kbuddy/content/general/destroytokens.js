console.log("[KoGaMaBuddy] DestroyToken loaded");

const AuthMeta = document.querySelector("meta[name=Authorization-Session]");
const CSRFMeta = document.querySelector("meta[name=CSRFToken]");
const authToken = AuthMeta.content;
const csrfToken = CSRFMeta.content;

if (clientID !== 0) {
	window.addEventListener("load", () => {
		setTimeout(() => {
			AuthMeta.removeAttribute("content");
			CSRFMeta.removeAttribute("content");
		}, 1500);
	});

	if (document.getElementById("unity")) {
		observeAddedNodes("#unity", (node, destroyObserver) => {
			if (node.innerText !== "Started Game") return;
			AuthMeta.content = authToken;
			setTimeout(() => AuthMeta.removeAttribute("content"), 1500);
			return destroyObserver();
		});
	}
}