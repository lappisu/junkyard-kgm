console.log("[KoGaMaBuddy] ProfileButtons loaded");

const PROFILE_BUTTON_TAG = "a.create.pure-button.pure-button-xsmall.pure-button-primary.inactive";
const sectionTop = document.querySelector("#profile-page > .section-top");
const profileButtons = [];

const PersonalProfileView = async () => {
	const isViewingWall = location.search.includes("view_wall=1");
	const switchViewLocale = await getLocaleString(pageData.locale, `Profile:ProfileButtons:View${isViewingWall ? "Public" : "Personal"}`);
	const switchViewButton = createElement("div.kb-profile-button.kb-pb-primary.kb-switch-view", [
		createElement(PROFILE_BUTTON_TAG, {
			onClick: () => location.search = isViewingWall ? "" : "?view_wall=1"
		}, switchViewLocale)
	]);
	profileButtons.push(switchViewButton);

	if (isViewingWall) {
		const [
			nukeButtonLocale,
			nukeWarningLocale,
			nukeLoadingLocale
		] = await getLocaleStrings(pageData.locale, [
			"Profile:ProfileButtons:NukeButton",
			"Profile:ProfileButtons:NukeWarning",
			"Profile:ProfileButtons:NukeLoad"
		]);

		const nukeWallButton = createElement("div.kb-profile-button.kb-pb-secondary.kb-nuke-wall", [
			createElement(PROFILE_BUTTON_TAG, {
				async onClick() {
					if (this.isNuking || !window.confirm(nukeWarningLocale)) return;
					this.isNuking = true;

					let postsProcessed = 0, postsFailed = 0;

					const nukeDisplayContainer = createElement("p", [
						createElement("span.kb-nuke-loading", "☢"),
						document.createTextNode(" "),
						document.createTextNode(nukeLoadingLocale)
					]);
					const nukeContainer = createElement("div.kb-overlay-container", [
						createElement("div.kb-nuke-wall-container", [
							nukeDisplayContainer
						])
					]);
					document.body.appendChild(nukeContainer);

					const wallPosts = await getAllPosts(clientID);
					if (wallPosts.length === 0) {
						const nukeEmptyLocale = await getLocaleString(pageData.locale, "Profile:ProfileButtons:NukeEmpty");
						nukeContainer.remove();
						return alert(nukeEmptyLocale);
					}

					const processedPostsDisplay = createElement("span", "0");
					const totalPostsDisplay = createElement("span", wallPosts.length.toString());
					nukeDisplayContainer.replaceWith(
						createElement("p", [
							document.createTextNode("☢ "),
							processedPostsDisplay,
							document.createTextNode("/"),
							totalPostsDisplay
						])
					);

					const sleep = ms => new Promise(f => setTimeout(f, ms));
					const deletePost = post => safeFetch(`/api/feed/${clientID}/${post.id}/`, { method: "DELETE" });

					for (const post of wallPosts) {
						await Promise.all([
							sleep(500),
							deletePost(post)
						]).catch(() => {
							++postsFailed;
							// TODO: Display failed post count
						});
						processedPostsDisplay.innerText = (++postsProcessed).toString();
					}
					await sleep(2500);
					location.search = "";
				}
			}, "☢ " + nukeButtonLocale)
		]);
		profileButtons.push(nukeWallButton);
	}

	sectionTop.prepend(createElement("div.kb-pb-container", profileButtons));
};

const FriendProfileView = async () => {
	const profileID = pageData.object.id;
	const favoriteFriendsKey = `${server}:${clientID}:favorite_friends`;
	const [
		favoriteLocale,
		unfavoriteLocale,
		unfriendLocale
	] = await getLocaleStrings(pageData.locale, [
		"Profile:ProfileButtons:FavoriteButton",
		"Profile:ProfileButtons:UnfavoriteButton",
		"Profile:ProfileButtons:UnfriendButton"
	]);
	const favoriteFriends = await getStoredData(favoriteFriendsKey, []);

	let isFavorite = favoriteFriends.includes(profileID);
	const favoriteButton = createElement("div.kb-profile-button.kb-pb-primary.kb-favorite-friend", [
		createElement(PROFILE_BUTTON_TAG + (isFavorite ? ".is-favorite" : ""), {
			async onClick() {
				if (isFavorite) {
					favoriteFriends.splice(favoriteFriends.indexOf(profileID), 1);
				} else {
					favoriteFriends.push(profileID);
				}
				await setStoredData(favoriteFriendsKey, favoriteFriends);
				isFavorite = !isFavorite;
				this.innerText = isFavorite ? `✰ ${unfavoriteLocale}` : `★ ${favoriteLocale}`;
				this.classList.toggle("is-favorite");
				// Trigger Favorite Friends list update; to be removed with DELTA FERN
				await content.fetch(`${location.origin}/user/${clientID}/friend/chat/`);
			}
		}, isFavorite ? `✰ ${unfavoriteLocale}` : `★ ${favoriteLocale}`)
	]);
	profileButtons.push(favoriteButton);

	const unfavoriteButton = createElement("div.kb-profile-button.kb-pb-secondary", [
		createElement(PROFILE_BUTTON_TAG, {
			async onClick() {
				try {
					await safeFetch(`/user/${clientID}/friend/${profileID}/`, { method: "DELETE" });
					document.getElementById("profile-status-update").remove();
					favoriteButton.remove();
					this.remove();
				} catch(error) {
					// TODO: Display error message
				}
			}
		}, unfriendLocale)
	]);
	profileButtons.push(unfavoriteButton);

	sectionTop.prepend(createElement("div.kb-pb-container", profileButtons));
};

const BlockedUserView = async () => {
	const unblockButton = document.getElementById("kb-unblock");
	unblockButton.addEventListener("click", async () => {
		const profileID = pageData.object.id;
		const blockedUsersKey = `${server}:${clientID}:blocked_users`;
		const blockedUsers = await getStoredData(blockedUsersKey, []);
		blockedUsers.splice(blockedUsers.indexOf(profileID), 1);
		await setStoredData(blockedUsersKey, blockedUsers);
		location.reload(true);
	});
};

const OtherProfileView = async () => {
	const profileID = pageData.object.id;
	const friendData = await getFriendStatus(profileID);
	const blockButtonLocale = await getLocaleString(pageData.locale, "Profile:ProfileButtons:BlockButton");

	if (friendData.status === "inbound") {
		const [
			acceptButtonLocale,
			rejectButtonLocale
		] = await getLocaleStrings(pageData.locale, [
			"Profile:ProfileButtons:AcceptButton",
			"Profile:ProfileButtons:RejectButton"
		]);
		const acceptButton = createElement("div.kb-accept-request", [
			createElement(PROFILE_BUTTON_TAG, {
				async onClick() {
					const putData = JSON.stringify({
						id: friendData.id,
						status: "accept",
						friend_status: "pending",
						friend_profile_id: pageData.current_user.id,
						friend_username: pageData.current_user.username,
						friend_images: pageData.current_user.images,
						profile_id: pageData.object.id,
						profile_username: pageData.object.username,
						profile_images: pageData.object.images
					});
					const putResponse = await content.fetch(`${location.origin}/user/${clientID}/friend/${profileID}/`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Content-Length": putData.length,
							"X-Csrf-Token": csrfToken
						},
						body: putData
					}).then(res => res.json());
					// If the API rejects the PUT request, send a friend request back
					if (putResponse.error) {
						const postData = JSON.stringify({
							user_id: pageData.object.id,
							profile_id: pageData.current_user.id,
							friend_images: pageData.current_user.images
						});
						const postResponse = await content.fetch(`${location.origin}/user/${clientID}/friend/`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"Content-Length": postData.length,
								"X-Csrf-Token": csrfToken
							},
							body: postData
						}).then(res => res.json());
						// Both methods have failed; display error
						if (postResponse.error) {
							displayNotification(postResponse.error.__all__, "warning");
							return console.error(postResponse.error.__all__);
						}
					}
					inboundRequestContainer.remove();
					blockButton.remove();
				}
			}, acceptButtonLocale)
		]);
		const rejectButton = createElement("div.kb-reject-request", [
			createElement(PROFILE_BUTTON_TAG, {
				async onClick() {
					try {
						await safeFetch(`/user/${clientID}/friend/${profileID}/`, { method: "DELETE" });
						inboundRequestContainer.remove();
						blockButton.classList.add("kb-pb-primary");
						blockButton.classList.remove("kb-pb-secondary");
					} catch(error) {
						// TODO: Display error message
					}
				}
			}, rejectButtonLocale)
		]);
		const inboundRequestContainer = createElement("div.kb-profile-button.kb-pb-primary.kb-inbound-container", [
			acceptButton, rejectButton
		]);
		document.querySelector(".section-friend-request").remove();
		profileButtons.push(inboundRequestContainer);
	} else if (friendData.status === "outbound") {
		const pendingButtonLocale = await getLocaleString(pageData.locale, "Profile:ProfileButtons:PendingButton");
		const pendingButton = createElement("div.kb-profile-button.kb-pb-primary.kb-cancel-pending", [
			createElement(PROFILE_BUTTON_TAG, {
				async onClick() {
					try {
						await safeFetch(`/user/${profileID}/friend/${clientID}/`, { method: "DELETE" });
						pendingButton.remove();
						blockButton.classList.add("kb-pb-primary");
						blockButton.classList.remove("kb-pb-secondary");
					} catch(error) {
						// TODO: Display error message
					}
				}
			}, pendingButtonLocale)
		]);
		document.querySelector(".section-friend-request").remove();
		profileButtons.push(pendingButton);
	} else {
		profileButtons.push(document.querySelector(".section-friend-request"));
	}

	const blockButton = createElement("div.kb-profile-button.kb-pb-secondary", [
		createElement(PROFILE_BUTTON_TAG, {
			async onClick() {
				const blockedUsersKey = `${server}:${clientID}:blocked_users`;
				const blockedUsers = await getStoredData(blockedUsersKey, []);
				blockedUsers.push(profileID);
				await setStoredData(blockedUsersKey, blockedUsers);
				location.reload(true);
			}
		}, blockButtonLocale)
	]);
	profileButtons.push(blockButton);

	sectionTop.prepend(createElement("div.kb-pb-container", profileButtons));
};

if (/^\/profile\/\d+\/$/.test(location.pathname) && clientID !== 0) {
	if (pageData.object.is_me) PersonalProfileView();
	else if (pageData.is_friend) FriendProfileView();
	else if (window.wrappedJSObject.KB_PROFILE_BLOCKED) BlockedUserView(); 
	else OtherProfileView();
}

async function getFriendStatus(profileID) {
	const inboundRequest = await fetch(`${location.origin}/user/${profileID}/friend/${clientID}/`);
	if (inboundRequest.ok) return inboundRequest.json().then(res => ({ ...res.data, status: "inbound" }));
	const outboundRequest = await fetch(`${location.origin}/user/${clientID}/friend/${profileID}/`);
	return outboundRequest.ok
		? outboundRequest.json().then(res => ({ ...res.data, status: "outbound" }))
		: ({ friend_profile_id: clientID, profile_id: profileID, friend_status: "none", status: "none" })
}

async function getAllPosts(profileID) {
	const feed = await fetchJSON(`/api/feed/${profileID}/`, {
		credentials: "omit"
	});
	let posts = feed.data;
	for (const path of feed.paging.paging_links.slice(1)) {
		const { data } = await fetchJSON(path.url, {
			credentials: "omit"
		});
		posts = [...posts, ...data];
	}
	return posts;
}