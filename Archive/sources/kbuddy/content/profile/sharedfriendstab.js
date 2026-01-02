console.log("[KoGaMaBuddy] SharedFriendsTab loaded");

if (location.pathname.endsWith("/friends/") && clientID !== 0) {
	// SharedTab Template - Scoped to load only when necessary
	const createSharedTab = createHTMLTemplate(
	`<li itemscope="itemscope" itemtype="http://data-vocabulary.org/Breadcrumb" class="shared-friends">
	  <svg viewBox="0 0 48 48">
		<path d="M17.17 32.92l9.17-9.17-9.17-9.17L20 11.75l12 12-12 12z"></path>
	  </svg>
	  <a itemprop="url" href="/profile/{{profileID}}/friends/shared/">
		<span class="title sf-span" itemprop="title">{{sharedTabLocale}}</span>
	  </a>
	</li>`
	);
	// Display tab
	getLocaleString(pageData.locale, "Background:SharedFriends:SharedCategory").then(sharedTabLocale => {
		const friendsTab = document.querySelector("ul.breadcrumb > li:nth-child(2)");
		friendsTab.childNodes[0].setAttribute("style", "fill:hsla(0,0%,100%,.83);");
		friendsTab.childNodes[1].childNodes[0].setAttribute("style", "color:hsla(0,0%,100%,.83);");
		const sharedTab = createSharedTab({
			sharedTabLocale, profileID: pageData.object.id
		});
		friendsTab.parentNode.appendChild(sharedTab);
	});
}