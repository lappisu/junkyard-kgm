createPage(
	"/build/*/project/search/",
	"/build/*/project/?page=1&count=1",
	d => d.url.includes(getClientID(d.url)) && getClientID(d.url) !== 0 ? false : "/build/",
	async (body) => {
		const doc = domParser.parseFromString(body, "text/html");
		const pageLocale = /"locale": "(\w+)"/.exec(body)[1];
		const [
			PlaceholderLocale,
			SearchButtonLocale
		] = await getLocaleStrings(pageLocale, [
			"Background:ProjectSearch:Placeholder",
			"Background:ProjectSearch:SearchButton"
		]);
		//	Clear everything
		const header = doc.querySelector(".project-list-header");
		while (header.lastChild) header.removeChild(header.lastChild);
		const gamesList = doc.querySelector("ul.games-list");
		while (gamesList.lastChild) gamesList.removeChild(gamesList.lastChild);
		const paging = doc.querySelector(".paging");
		if (paging) paging.parentNode.removeChild(paging);
		//	Create search bar
		const searchBox = document.createElement("INPUT");
		searchBox.setAttribute("id", "ps_box");
		searchBox.setAttribute("type", "text");
		searchBox.setAttribute("max-length", "45");
		searchBox.setAttribute("autocomplete", "off");
		searchBox.setAttribute("placeholder", PlaceholderLocale);
		searchBox.setAttribute("style", "width:30%;vertical-align:top;height:30px;border:1px solid black;padding-left:8px;");
		//	Create button
		const searchButton = document.createElement("BUTTON");
		searchButton.setAttribute("id", "ps_button");
		searchButton.setAttribute("style", "margin-left:7px;vertical-align:top;height:30px;border:1px solid black;line-height:1px;");
		searchButton.innerText = SearchButtonLocale;
		//	Append search system
		header.appendChild(searchBox);
		header.appendChild(searchButton);
		//	Insert project search script
		const psScript = document.createElement("SCRIPT");
		psScript.src = chrome.runtime.getURL("/content/build/ps_system.js");
		doc.body.appendChild(psScript);
		//	Return new page
		return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
	}
);