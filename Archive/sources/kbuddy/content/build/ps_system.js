// Javascript implementation of Simon White's StrikeAMatch algorithm
// http://www.catalysoft.com/articles/StrikeAMatch.html
class LetterPairSimilarity {
	static compareStrings(str1, str2) {
		const pairs1 = this.wordLetterPairs(str1.toUpperCase());
		const pairs2 = this.wordLetterPairs(str2.toUpperCase());
		let intersection = 0, union = pairs1.length + pairs2.length;
		for (const pair1 of pairs1) {
			for (const pair2 of pairs2) {
				if (pair1 === pair2) {
					++intersection;
					pairs2.splice(pairs2.indexOf(pair2), 1);
					break;
				}
			}
		}
		return (2 * intersection) / union;
	}
	static wordLetterPairs(str) {
		return str.split(/\s/).map(word => this.letterPairs(word)).flat();
	}
	static letterPairs(str) {
		const numPairs = str.length - 1;
		const pairs = [];
		for (let i = -1; i < numPairs; ++i) {
			pairs[i] = str.substring(i, i+2);
		}
		return pairs;
	}
}

const fetchJSON = (url, opts) => fetch(url[0] === "/" ? location.origin + url : url, opts).then(r => r.json());

function createHTMLTemplate(htmlString) {
	const parser = new DOMParser();
	return (opts) => {
		const builtString = htmlString.replace(/{{(\w+)}}/g, (_, prop) => opts[prop]);
		const builtDOM = parser.parseFromString(builtString, "text/html");
		return builtDOM.body.childNodes[0];
	};
}

async function getAllProjects() {
	const firstPage = await fetchJSON("/game/?page=1&count=400");
	let projects = firstPage.data;
	for (const path of firstPage.paging.paging_links.slice(1)) {
		const response = await fetchJSON(path.url);
		projects = [ ...projects, ...response.data ];
	}
	return projects;
}

const clientID = /\d+/.exec(location.pathname)[0];
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

getAllProjects().then(projects => {
	const searchBox = document.getElementById("ps_box");
	const searchButton = document.getElementById("ps_button");
	const gamesList = document.querySelector("ul.games-list");
	searchButton.onclick = () => {
		while (gamesList.lastChild) gamesList.removeChild(gamesList.lastChild);
		const query = searchBox.value.trim().toLowerCase();
		if (query.length === 0) return;
		const found = projects.filter(game => {
			return game.name.toLowerCase().includes(query)
			|| LetterPairSimilarity.compareStrings(game.name, query) > 0.35;
		}).sort((a,b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1);
		for (const game of found) {
			gamesList.appendChild(createGameCard({
				projectName: game.name,
				projectID: game.id,
				imageUrl: game.images.medium,
				likes: game.likes,
				plays: game.played
			}));
		};
	};
});