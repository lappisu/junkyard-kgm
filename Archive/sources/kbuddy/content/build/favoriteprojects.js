console.log("[KoGaMa Buddy] FavoriteProjects loaded");

const PROJECT_VIEW = /\/build\/($|\d+\/project\/($|\?category=\w+))/;
const PROJECT_PAGE = /\/build\/\d+\/project\/\d+\//;

const createGameCard = createHTMLTemplate(
`<li class="game-item">
  <a href="/build/${clientID}/project/{{projectID}}/">
    <div class="game-image" style="background-image: url({{imageUrl}})"></div>
    <div class="game-name-stats">
      <div class="game-name">{{projectName}}</div>
      <ul class="game-stats">
        <li class="game-likes">
          <span class="data tool-tip" data-placement="top" data-original-title="Likes"><i class="icon-heart"></i> {{likes}}</span>
        </li>
        <li class="game-played">
          <span class="data tool-tip" data-placement="top" data-original-title="Play count"><i class="icon-gamepad"></i> {{plays}}</span>
        </li>
      </ul>
    </div>
  </a>
</li>`
);

async function getFavoriteProjects() {
	const favoriteKey = `${server}:${clientID}:favorite_projects`;
	const favoriteProjectIDs = await getStoredData(favoriteKey, []);
	const favoriteProjects = [], invalidProjects = [];
	for (const projectID of favoriteProjectIDs) {
		try {
			const {data} = await fetchJSON(`/game/${projectID}/`);
			favoriteProjects.push(data);
		} catch(error) {
			if (error.name === "SyntaxError") {
				console.log(`Project with ID ${projectID} is unavailable; queued to be removed from list.`);
				invalidProjects.push(projectID);
			} else {
				//	Unknown error
				console.error(`Encountered error while retrieving project with ID ${projectID}`, error);
				break;
			}
		}
	}
	//	@TODO: remove invalid projects
	return favoriteProjects;
}

if (PROJECT_VIEW.test(location.pathname)) {
	getLocaleStrings(pageData.locale, [
		"Build:FavoriteProjects:ProjectSearch",
		"Build:FavoriteProjects:FavoriteCategory"
	]).then(([projectSearch, favoriteCategory]) => {
		//	Get mount points
		const filterNav = document.querySelector("ul.project-list-filter-nav");
		const invitations = document.querySelector("div.build-invites");
		//	Create Favorite category
		const favoriteTab = document.createElement("LI");
		favoriteTab.setAttribute("class", "item");
		const favoriteLink = document.createElement("A");
		favoriteLink.setAttribute("href", `/build/${clientID}/project/?category=favorite`);
		favoriteLink.appendChild(document.createTextNode(favoriteCategory));
		favoriteTab.appendChild(favoriteLink);
		//	Create Project Search button
		const pSearchButton = createElement("div.build-invites", [
			createElement("a", { href: `/build/${clientID}/project/search/` }, [
				createElement("i.icon-search"),
				document.createTextNode(" " + projectSearch)
			])
		]);
		//	Append button and category
		filterNav.appendChild(favoriteTab);
		invitations.parentNode.insertBefore(pSearchButton, invitations.nextSibling);
		//	Check if viewing favorites
		if (location.search === "?category=favorite") {
			//	Clear page and make favorite category active
			const gamesList = document.querySelector("ul.games-list");
			while (gamesList.lastChild) gamesList.removeChild(gamesList.lastChild);
			const paging = document.querySelector(".paging");
			if (paging) paging.parentNode.removeChild(paging);
			favoriteTab.classList.add("active");
			getFavoriteProjects().then(favorites => {
				for (const game of favorites) {
					gamesList.appendChild(createGameCard({
						projectName: game.name,
						projectID: game.id,
						imageUrl: game.images.medium,
						likes: game.likes,
						plays: game.played
					}));
				}
			});	
		}
	});
} else if (PROJECT_PAGE.test(location.pathname)) {
	const favoriteKey = `${server}:${clientID}:favorite_projects`;
	getStoredData(favoriteKey, []).then(async favoriteProjects => {
		const [ AddFavorite, RemoveFavorite ] = await getLocaleStrings(pageData.locale, [
			"Build:FavoriteProjects:AddFavorite",
			"Build:FavoriteProjects:RemoveFavorite"
		]);
		const projectID = /\/project\/(\d+)\//.exec(location.pathname)[1];
		let isFavorite = favoriteProjects.includes(projectID);
		const favoriteButton = document.createElement("BUTTON");
		favoriteButton.setAttribute("class", "pure-button pure-button-small");
		favoriteButton.setAttribute("style", `font-size:80%;line-height:24px;background-color:#${isFavorite?"e0841d":"eaad00"};`);
		favoriteButton.innerText = isFavorite ? `✰ ${RemoveFavorite}` : `★ ${AddFavorite}`;
		favoriteButton.onclick = async function() {
			if (isFavorite) {
				favoriteProjects.splice(favoriteProjects.indexOf(projectID), 1);
			} else {
				favoriteProjects.push(projectID);
			}
			await setStoredData(favoriteKey, favoriteProjects);
			isFavorite = !isFavorite;
			this.innerText = isFavorite ? `✰ ${RemoveFavorite}` : `★ ${AddFavorite}`;
			this.style["background-color"] = isFavorite ? "#e0841d" : "#eaad00";
		};
		document.querySelector(".stats-like").appendChild(favoriteButton);
	});
}