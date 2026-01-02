console.log("[KoGaMaBuddy] BetterChat loaded");

//	Tourists can't chat
if (clientID !== 0) {
	//	Chat Notification Variables
	let newMessages = 0;
	const pageTitle = document.title;
	const notificationSound = new Audio(chrome.runtime.getURL("resources/notification.mp3"));

	//	Chat Toggle Variables
	let isChatHidden = window.localStorage.getItem("kb-chat-hidden") === "true";
	const chatToggle = document.getElementById("navigation-chat-toggler");
	const chatSidebar = document.getElementById("chat-extended-side");
	const contentContainer = document.getElementById("content");

	//	[Toggle] Initialize toggle on Desktop
	if (window.innerWidth > 1280) {
		//	Update chat display based on stored preference
		updateChatDisplay();
		//	Toggle chat visibility
		chatToggle.addEventListener("click", event => {
			event.stopPropagation();
			isChatHidden = !isChatHidden;
			updateChatDisplay();
			window.localStorage.setItem("kb-chat-hidden", isChatHidden.toString());
		});
	}

	//	[Notification] Reset notification count and display
	window.addEventListener("focus", () => {
		newMessages = 0;
		document.title = pageTitle;
	});

	//	[Notification] Register background message handler
	chrome.runtime.onMessage.addListener(focusEvents);

	//	[Notification] Check tab focus state and allow chats to be opened
	function focusEvents(event) {
		if (event.type === "NOTIF_SOUND") {
			notificationSound.play();
			if (!document.hasFocus() && event.data.subtype === "CHAT")
				document.title = `(${++newMessages}) ${pageTitle}`;
			return true;
		} else if (event.type === "CHECK_TAB_FOCUS") {
			return document.hasFocus();
		} else if (event.type === "CHAT_FOCUS") {
			return openChat(event.data.username), true;
		}
		return undefined;
	}

	//	[Notification] Opens chat for specified username
	function openChat(username) {
		const nameNode = [...document.querySelectorAll("p._3zDi-")].find(node => node.innerText === username);
		return (isChatHidden && chatToggle.click()) || (nameNode && nameNode.parentNode.click());
	}

	//	[Toggle] Update chat display
	function updateChatDisplay() {
		contentContainer.classList[ isChatHidden ? "remove" : "add" ]("authenticated");
		chatSidebar.classList[ isChatHidden ? "remove" : "add" ]("show");
	}
}