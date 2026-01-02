console.log("[KoGaMaBuddy] PageLoad loaded");

//	KB SPA-M: KoGaMa Buddy Single Page Application Mode
if (sessionStorage.getItem("kb-spam-disable") !== "true") {
	const PROFILE_AVATARS = /\/(?:build|profile)\/\d+\/avatars\//;
	document.getElementById("mobile-page").addEventListener("click", event => {
		const destination = event.target.href || event.target.parentNode.href;
		if (
			!destination
			|| !destination.includes("page")
			|| destination.includes("feed")
			|| destination.includes("comment")
			|| PROFILE_AVATARS.test(destination)
			|| destination.includes("invitations")
		) return;
		event.preventDefault();
		safeFetch(destination)
			.catch(error => {
				if (destination.includes("/marketplace/search/")) return error.response;
				sessionStorage.setItem("kb-spam-disable", "true");
				location.href = destination;
			})
			.then(res => res.text())
			.then(body => {
				const fetchedDocument = domParser.parseFromString(body, "text/html");
				const fetchedContent = document.importNode(fetchedDocument.getElementById("mobile-page-content"), true);
				document.getElementById("mobile-page-content").replaceWith(fetchedContent);
				window.history.replaceState(null, fetchedDocument.title, destination);
			});
	});
}