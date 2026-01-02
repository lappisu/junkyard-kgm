console.log("[KoGaMaBuddy] ClientStats loaded");

// Friends Limit and Level Title
const friendsDisplay = document.querySelector(".friends.progression-item .data");
const levelBadge = document.querySelector(".progression .level img");
if (friendsDisplay && levelBadge) {
	friendsDisplay.innerText += "/" + pageData.object.friends_limit;
	levelBadge.alt = levelBadge.title = pageData.object.level;
}

// Creation Stats
if (isClientProfile) {
	const NotifyToken = document.querySelector("meta[name=Notify-Token]").content;
	const notificationURL = `https://api-${server}.kgoma.com/v1/notify/c/?token=${NotifyToken}&generation=0`;
	content.fetch(notificationURL).then(r => r.json()).then(async stats => {
		const [
			headerLocale, publishedLocale, avatarLocale, modelLocale, totalItemLocale
		] = await getLocaleStrings(pageData.locale, [
			"Profile:Stats:Heading",
			"Profile:Stats:GamesPublished",
			"Profile:Stats:AvatarsSold",
			"Profile:Stats:ModelsSold",
			"Profile:Stats:ItemsSold"
		]);
		const statsContainer = createStatsSection({
			headerLocale,
			publishedLocale,
			avatarLocale,
			modelLocale,
			totalItemLocale,
			gamesPublished: stats.published_games,
			totalProjects: stats.projects,
			percentage: formatPercent((stats.published_games / stats.projects) || 0),
			avatarsSold: formatNum(stats.sold_avatars),
			modelsSold: formatNum(stats.sold_models),
			totalItemsSold: formatNum(stats.sold_avatars + stats.sold_models)
		});
		document.querySelector("section.creations-custom").appendChild(statsContainer);
	});
}

const createStatsSection = createHTMLTemplate(
`<div class="section-description">
  <div class="description-container">
    <div class="header">{{headerLocale}}</div>
    <div style="font-size:14px;font-weight:bold;">
      <ul style="list-style-type:none;padding-top:4px;padding-left:10px;padding-bottom:9px;margin:0;">
        <li>{{publishedLocale}}: {{gamesPublished}}/{{totalProjects}} ({{percentage}})</li>
        <li>{{avatarLocale}}: {{avatarsSold}}</li>
        <li>{{modelLocale}}: {{modelsSold}}</li>
        <li>{{totalItemLocale}}: {{totalItemsSold}}</li>
      </ul>
    </div>
  </div>
</div>`
);

const formatNum = num => num.toLocaleString("fr-FR");
const formatPercent = num => num.toLocaleString(undefined,{style:"percent",maximumFractionDigits:2});