console.log("[KoGaMaBuddy] StandaloneButton loaded");

if (
	document.cookie.includes("_pp=WEBGL") ||
	location.search.includes("webgl=1")
)
Promise.all([
	getLocaleString(pageData.locale, "Game:StandaloneButton:PlayStandalone"),
	waitForMutation(document.getElementById("unity"), { childList: true })
]).then(([ PlayStandaloneLocale ]) => {
	const playButton = createElement("buttton.pure-button.pure-button-primary", {
		onClick() {
			const search = new URLSearchParams(location.search);
			search.delete("webgl");
			search.delete("autoplay");
			search.set("standalone", "1");
			return location.search = search.toString();
		}
	}, PlayStandaloneLocale);
	document.querySelector("#webgl-play").parentNode.appendChild(playButton);
});