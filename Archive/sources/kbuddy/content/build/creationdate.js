console.log("[KoGaMaBuddy] CreationDate loaded");

if (/^\/build\/\w+\/project\/\w+\/$/.test(location.pathname)) {
	const creationDate = new Date(pageData.object.created);
	const creationDateDisplay = creationDate.toLocaleDateString(pageData.locale.slice(0,2), {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
	const creationDateContainer = createElement("div.pure-u-1-2.stats-item.created.no-border", [
		createElement("div.m-10", [
			createElement("div.game-online", [
				createElement("span.data.tool-tip", {
					"data-placement": "bottom",
					"data-original-title": "Created"
				}, [
					createElement("i.icon-calendar-inv"),
					document.createTextNode(" " + creationDateDisplay)
				])
			])
		])
	]);	
	const likesContainer = document.querySelector(".game-stats.pure-g > div:nth-child(2)");
	likesContainer.insertAdjacentElement("afterend", creationDateContainer);
}