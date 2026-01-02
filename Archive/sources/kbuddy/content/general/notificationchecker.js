console.log("[KoGaMaBuddy] NotificationChecker loaded");

const NotifyToken = document.querySelector("[name=Notify-Token]").content;
if (NotifyToken.length) {
	let generation = 0;
	setInterval(async() => {
		({generation} = await content.fetch(`https://api-${server}.kgoma.com/v1/notify/c/?token=${NotifyToken}&generation=${generation}`).then(r => r.json()));
	}, 45000);
}