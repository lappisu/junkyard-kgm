console.log("[KoGaMaBuddy] StandaloneLaunch loaded");

if (
	(document.cookie.includes("_pp=STANDALONE") || location.search.includes("standalone=1")) &&
	(!location.search.includes("webgl=1") || !location.search.includes("autoplay"))
)
Promise.all([
	getStoredData(`${server}:${clientID}:automatic_standalone`, "LAUNCH"),
	getLocaleStrings(pageData.locale, [
		"Game:StandaloneLaunch:EnableLaunch",
		"Game:StandaloneLaunch:DisableLaunch"
	])
]).then(([ launchOption, [ enableLaunchLocale, disableLaunchLocale ] ]) => {
	let isLaunchPrevented = launchOption === "PREVENT";
	const unityContainer = document.getElementById("unity");
	const toggleButton = createElement("div", [
		createElement("button.pure-button.pure-button-primary" + (isLaunchPrevented ? ".pure-button-success" : ""), {
			async onClick() {
				isLaunchPrevented = !isLaunchPrevented;
				await setStoredData(`${server}:${clientID}:automatic_standalone`, isLaunchPrevented ? "PREVENT" : "LAUNCH");
				this.innerText = isLaunchPrevented ? enableLaunchLocale : disableLaunchLocale;
				this.classList.toggle("pure-button-success");
			}
		}, isLaunchPrevented ? enableLaunchLocale : disableLaunchLocale)
	]);

	// Create Standalone Launch Button
	if (isLaunchPrevented) {
		// Prevent "Connect to game server error" warning
		observeAddedNodes("#notification", (node, destroyObserver) => {
			return node.classList.contains("warning") && destroyObserver() && node.remove();
		});
		// Prevent Play button from launching WebGL
		const createLauncherContainer = ([ startButtonLocale, errorLocale, notInstalledLocale, notSupportedLocale ]) => {
			return createElement("div#unity", [
				createElement("div", [
					createElement("div#unity-player-container-wrapper.webgl-loading", [
						createElement("div#unity-play-button-container", [
							createElement("div.container.play-button", [
								createElement("div.game-image-container", [
									createElement("div.game-image", {
										style: `background-image: url(${pageData.object.images.large})`
									})
								]),
								createElement("div.webgl-loading", [
									createElement("button#webgl-play.btn.btn-xlarge.extra-bold.caps.webgl-play", {
										async onclick() {
											if (this.isLoading) return;
											this.isLoading = true;
											this.setAttribute("disabled", "");

											const newSessionURL = new URL(`https://api-${server}.kgoma.com/v1/locator/session/`);
											with (newSessionURL.searchParams) {
												set("objectID", pageData.object.id);
												set("profileID", clientID);
												set("lang", pageData.locale);
												if (location.pathname.includes("games")) set("type", pageData.game_type);
												else if (location.pathname.includes("project")) set("type", "edit");
												else if (location.pathname.includes("avatar")) set("type", "character");
												if (clientID > 0) set("session", authToken);
												set("launch", "1");
											}
											const sessionData = await content.fetch(newSessionURL.href).then(r => r.json());
											if (sessionData.error) {
												this.isLoading = false;
												this.removeAttribute("disabled");
												return alert(errorLocale);
											}
											const sessionURL = new URL(`https://api-${server}.kgoma.com/v1/locator/session/${sessionData.id}/`);
											with (sessionURL.searchParams) {
												set("token", sessionData.sessionToken);
												set("plugin", "STANDALONE");
												set("ssl", "1");
												set("unityPacket", "1");
											}
											const sessionURI = `kogama2-${server}:kogamaPackage:${btoa(sessionURL.href)}`;
											const launchFrame = createElement("iframe", { src: sessionURI, hidden: "" });
											document.body.appendChild(launchFrame);
											await new Promise(f => setTimeout(f, 500));
											const isStandaloneInstalled = launchFrame.contentDocument !== null;
											launchFrame.remove();
											if (!isStandaloneInstalled) {
												if (window.navigator.userAgent.includes("Windows")) {
													if (window.confirm(notInstalledLocale)) {
														const parseClientInfo = (body) => {
															const firstIndex = body.indexOf("_.extend(options, {") + 18;
															const lastIndex = body.indexOf("});", firstIndex) + 1;
															const data = body.substring(firstIndex, lastIndex);
															return JSON.parse(data.replace("UNITY_CLIENT_URLS", "\"$&\""));
														};
														const clientInfo = parseClientInfo(document.querySelector("body > script").innerText);
														createElement("a", {
															href: clientInfo.UNITY_CLIENT_URLS.StandaloneBootstrap2,
															download: "KoGaMaLauncher.msi",
														}, "KoGaMaLauncher.msi").click();
													};
													this.isLoading = false;
													this.removeAttribute("disabled");
												} else {
													alert(notSupportedLocale);
													location.search = "webgl=1";
												}
											}
										}
									}, startButtonLocale),
									toggleButton
								])
							])
						])
					])
				])
			]);
		};
		observeAddedNodes(unityContainer, (_, destroyObserver) => {
			getLocaleStrings(pageData.locale, [
				`Game:StandaloneLaunch:${location.pathname.includes("games") ? "Play" : "Edit"}Button`,
				"Game:StandaloneLaunch:EncounteredError",
				"Game:StandaloneLaunch:NotInstalled",
				"Game:StandaloneLaunch:NotSupported"
			]).then(strings => {
				const launcherContainer = createLauncherContainer(strings);
				unityContainer.replaceWith(launcherContainer);
			});
			return destroyObserver();
		}, { childList: true });
		// Prevent KoGaMa from changing client to WebGL due to not launching Standalone
		window.addEventListener("beforeunload", () => document.cookie = "_pp=STANDALONE; path=/");
	} else {
		// Add Automatic Launch Toggle
		observeAddedNodes(unityContainer, (node, destroyObserver) => {
			if (!node.querySelector("button")) return;
			node.querySelector("button").parentNode.appendChild(toggleButton);
			return destroyObserver();
		});
	}
});