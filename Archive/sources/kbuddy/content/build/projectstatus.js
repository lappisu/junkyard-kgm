console.log("[KoGaMa Buddy] Project Status Loaded");

if (/^\/build\/(?:\w+\/project\/)?$/.test(location.pathname)) {
	Promise.all([
		getStoredData(`${server}:${clientID}:project_status`, "HIDDEN"),
		getLocaleString(pageData.locale, "General:Masking:ProjectStatus")
	]).then(([currentState, ProjectStatusLocale]) => {
		let isVisible = currentState === "VISIBLE";
		const submenuContainer = document.querySelector("#pagesubheader .submenu-container");
		const switchContainer = document.createElement("DIV");
		const textContainer = document.createElement("SPAN");
		const statusToggle = createToggle(isVisible);

		statusToggle.addEventListener("click", async () => {
			isVisible = !isVisible;
			await setStoredData(`${server}:${clientID}:project_status`, isVisible ? "VISIBLE" : "HIDDEN");
			statusToggle.classList.toggle("on");
		});

		switchContainer.classList.add("kb-project-status");
		textContainer.appendChild(document.createTextNode(ProjectStatusLocale));
		switchContainer.append(textContainer, statusToggle);
		submenuContainer.appendChild(switchContainer);
	});
}

function createToggle(state=false) {
	const toggleContainer = document.createElement("DIV");
	const switchButton = document.createElement("SPAN");

	toggleContainer.classList.add("kb-toggle");
	if (state) toggleContainer.classList.add("on");
	switchButton.classList.add("kb-switch");
	toggleContainer.appendChild(switchButton);

	return toggleContainer;
}