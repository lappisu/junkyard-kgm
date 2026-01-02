console.log("[KoGaMaBuddy] ChatPatch loaded");

if (clientID !== 0) {

	////////////////////
	/// No Lag Patch ///
	////////////////////

	const CES = document.getElementById("chat-extended-side");
	const appendedMessages = new Set();
	const profileIDMap = new Map(JSON.parse(sessionStorage.getItem("kb-pid-map")));
	let replacedTextarea = false;
	
	const getProfileID = username => {
		if (profileIDMap.has(username)) return profileIDMap.get(username);
		return fetchJSON(`/user/?q=${encodeURIComponent(username)}`)
			.then(({ data: [ { id: profileID } ] }) => {
				profileIDMap.set(username, profileID);
				return profileID;
			});
	}

	const sendMessage = async (username, content) => {
		const messageElement = createElement("div._1j2Cd._1Xzzq.kb-chat-loading", [
			createElement("p", content)
		]);
		CES.querySelector("div._2XaOw").appendChild(messageElement);
		messageElement.scrollIntoView();
		appendedMessages.add(messageElement);
		try {
			const profileID = await getProfileID(username);
			await safeFetch(`/chat/${clientID}/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json; charset=utf-8"
				},
				body: JSON.stringify({
					message: content,
					to_profile_id: profileID
				})
			});
			messageElement.classList.remove("kb-chat-loading");
			const currentChat = CES.querySelector("div._3DYYr._2dPu4 > p._1j2Cd");
			if (currentChat) currentChat.innerText = content;
		} catch(e) {
			console.error("Encountered error sending message?", e);
			messageElement.classList.remove("kb-chat-loading");
			messageElement.classList.add("kb-chat-error");
		}
	};

	const keypressHandler = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			const username = CES.querySelector("div._2XzvN").innerText;
			sendMessage(username, event.target.value);
			event.target.value = "";
		}
	};

	///////////////////
	/// Emote Popup ///
	///////////////////

	const createEmoteButton = (onClick) => {
		return createElement("div.emote-form-button-container", [
			createElement("div.emote-form-button", { onClick }, [
				createElement("i.icon-smile")
			])
		]);
	};

	const createEmotePopup = (emotes, onEmoteChosen, onClose) => {
		return createElement("div.emotes-popup", [
			createElement("div.emotes-collection", [
				createElement("div.emote-navigation", [
					createElement("ul.emote-navigation-list", [
						createElement("li.emote-use.active", [
							createElement("a", { href: "#" }, [
								createElement("i.icon-smile")
							])
						]),
						createElement("li.emote-quit", {
							onClick() {
								onClose();
							}
						}, [
							createElement("i.icon-cancel-circle")
						])
					])
				]),
				createElement("ul.emote-list", emotes.map(emote =>
					createElement("li", {
						onClick() {
							onEmoteChosen(emote);
						}
					}, [
						createElement("div.emote-img-container.tool-tip", {
							"data-original-title": emote.codename
						}, [
							createElement("img.emote-img", {
								src: emote.image,
								alt: emote.codename.slice(1)
							})
						])
					])
				)),
			]),
			createElement("div.arrow-bottom"),
			createElement("div.arrow-bottom-border")
		]);
	};

	/////////////////////////
	/// Inject Chat Patch ///
	/////////////////////////

	CES.addEventListener("click", ({ target }) => {
		if (target.tagName === "TEXTAREA" && !replacedTextarea) {
			// const clone = target.cloneNode();
			// target.value = "";
			// target.style.display = "none";
			// clone.classList.add("kb-chat-input-replacement");
			// clone.addEventListener("keypress", (event) => {
			// 	preventNewline(event);
			// 	debouncedKeypressHandler(event);
			// });
			let isPopupOpen = false;
			const isWhitespace = char => /^\s$/.test(char);
			const insertText = (textarea, content) => {
				const { value, selectionStart, selectionEnd } = textarea;
				const hasWhitespaceStart = selectionStart === 0 || isWhitespace(value[selectionStart - 1]);
				const hasContentEnd = value[selectionEnd] && !isWhitespace(value[selectionEnd]);
				const insertedContent = (hasWhitespaceStart ? '' : ' ') + content + (hasContentEnd ? ' ' : '');
				return ({
					value: value.slice(0, selectionStart) + insertedContent + value.slice(selectionEnd),
					position: selectionStart + insertedContent.length
				});
			};
			const inputReplacement = createElement("textarea.kb-chat-input-replacement", {
				placeholder: target.placeholder,
				onKeypress: keypressHandler
			});
			const onEmoteChosen = (emote) => {
				const { value, position } = insertText(inputReplacement, emote.codename);
				inputReplacement.value = value;
				inputReplacement.selectionStart = inputReplacement.selectionEnd = position;
				inputReplacement.focus();
			};
			const onPopupClose = () => {
				emotePopup.remove();
				isPopupOpen = false;
			};
			const emotePopupContainer = createElement("div.emote-form-popup-container");
			const emotePopup = createEmotePopup([...KOGAMA_EMOTE_MAP.values()], onEmoteChosen, onPopupClose);
			target.replaceWith(
				createElement("div#kb-chat-patch", [
					createEmoteButton(() => {
						if (isPopupOpen) emotePopup.remove();
						else emotePopupContainer.appendChild(emotePopup);
						isPopupOpen = !isPopupOpen;
					}),
					emotePopupContainer,
					inputReplacement
				])
			);
			inputReplacement.focus();
			replacedTextarea = true;
		} else if (target.closest("._1lvYU, ._3DYYr:not(._2dPu4)") !== null) {
			for (const el of appendedMessages) el.remove();
		} else if (target.classList.contains("icon-cancel")) {
			replacedTextarea = false;
		}
	});

	window.addEventListener("beforeunload", () => {
		sessionStorage.setItem("kb-pid-map", JSON.stringify([...profileIDMap.entries()]));
	});
}