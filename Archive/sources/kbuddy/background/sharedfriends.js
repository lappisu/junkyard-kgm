const friendCardTemplate = createHTMLTemplate(
`<li class="friend-item">
  <a href="/profile/{{profileID}}/">
    <div class="friend-image">
	  <div class="sub-avatar">
	    <svg class="sub-avatar-image-svg" view-box="0 0 32 32" height="32px" width="32px" clip-path-units="objectBoundingBox">
		  <defs>
		    <clipPath id="clip-hexagon">
              <polygon points="16 0, 30 8, 30 24, 16 32, 2 24, 2 8"></polygon>
		    </clipPath>
		    <linearGradient id="sub-avatar-gradiant" x1="0" x2="0" y1="0" y2="1">
			  <stop offset="0%" stopcolor="#68b3f5"></stop>
			  <stop offset="100%" stopcolor="#a5cffb"></stop>
		    </linearGradient>
		  </defs>
		  <rect width="32" height="32"></rect>
		  <image class="sub-avatar-image" xlink:href="{{imageUrl}}" width="32" height="32"></image>
	    </svg>
	  </div>
    </div>
    <div class="friend-name">{{username}}</div>
  </a>
</li>`
);

const sharedTabTemplate = createHTMLTemplate(
`<li itemscope="itemscope" itemtype="http://data-vocabulary.org/Breadcrumb">
  <svg viewBox="0 0 48 48">
    <path d="M17.17 32.92l9.17-9.17-9.17-9.17L20 11.75l12 12-12 12z"></path>
  </svg>
  <a itemprop="url" href="/profile/{{profileID}}/friends/">
	<span class="title" itemprop="title">{{sharedLocale}}</span>
  </a>
</li>`
);

function createFriendCard(friend) {
	const card = friendCardTemplate({
		username: friend.friend_username,
		profileID: friend.friend_profile_id,
		imageUrl: friend.friend_images.large,
	});
	if (Boolean(friend.is_subscriber)) {
		const EliteFrame = document.createElement("IMG");
		EliteFrame.setAttribute("class", "sub-avatar-frame");
		EliteFrame.setAttribute("src", "/static/img/sub-frame.svg");
		card.querySelector("div.sub-avatar").appendChild(EliteFrame);
	}
	return card;
}

async function getAllFriends(serverUrl, profileID) {
	const {paging} = await fetchJSON(`${new URL(serverUrl).origin}/user/${profileID}/friend/?page=1&count=1`);
	const {data} = await fetchJSON(`${new URL(serverUrl).origin}/user/${profileID}/friend/?page=1&count=${paging.total}`);
	return new Map(data.map(friend => [friend.friend_profile_id, friend]));
}

createPage(
	"/profile/*/friends/shared/",
	"/profile/*/friends/?page=1&count=1",
	d => d.url.includes(getClientID(d.url)) || getClientID(d.url) === 0 ? "/profile/*/friends/" : false,
	async (body, details) => {
		const doc = domParser.parseFromString(body, "text/html");
		let commonFriends = 0;
		//	Get details
		const profileID = parseNumber(details.url);
		const profileName = doc.querySelector("span.title").innerText;
		const locale = /"locale": "(\w+)"/.exec(body)[1];
		//	Get friends
		const clientFriends = await getAllFriends(details.url, getClientID(details.url));
		const userFriends = await getAllFriends(details.url, profileID);
		//	Clear list
		const friendsList = doc.querySelector("ul.friend-list");
		while (friendsList.lastChild) friendsList.removeChild(friendsList.lastChild);
		//	Append friends in common
		for (const [friendID, friend] of clientFriends) {
			if (userFriends.has(friendID)) {
				++commonFriends;
				friendsList.appendChild(createFriendCard(friend));
			}
		}
		//	Insert friends message
		const friendMessageKey = commonFriends === 0 ? "Background:SharedFriends:NoFriends"
			: commonFriends === 1 ? "Background:SharedFriends:OneFriend" : "Background:SharedFriends:MultipleFriends";
		const friendMessage = await getLocaleString(locale, friendMessageKey);
		const sharedMessage = document.createElement("H5");
		sharedMessage.setAttribute("style", "padding-bottom:15px;color:hsla(0,0%,100%,.73);");
		sharedMessage.appendChild(document.createTextNode(friendMessage.replace("{{amount}}", commonFriends.toString()).replace("{{user}}", profileName)));
		const friendsSection = doc.querySelector("section.friends");
		friendsSection.insertBefore(sharedMessage, friendsSection.firstChild);
		//	Get rid of paging
		const paging = doc.querySelector("div.paging");
		if (paging) paging.parentNode.removeChild(paging);
		//	Add Shared tab
		const sharedLocale = await getLocaleString(locale, "Background:SharedFriends:SharedCategory");
		const sharedTab = sharedTabTemplate({
			profileID, sharedLocale 
		});
		doc.querySelector("ul.breadcrumb").appendChild(sharedTab);
		//	Return new page
		return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
	}
);