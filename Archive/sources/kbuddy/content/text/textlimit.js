console.log("[KoGaMaBuddy] TextLimit loaded");

const MAX_LENGTH_MAP = {
	"status_message": 160,
	"comment": 1024,
	"description": 5024
};

function createCharacterCounter(characterLimit) {
	return createElement("div.kb-char-counter", [
		createElement("span", [ "0", " / ", characterLimit ])
	]);
}

function createInputCounterHandler(characterLimit, characterCounter) {
	let isWarningDisplayed = false;
	return ({ target }) => {
		try {
			if (target.value.length > characterLimit && !isWarningDisplayed) {
				target.parentNode.classList.add("error");
				isWarningDisplayed = true;
			} else if (target.value.length <= characterLimit && isWarningDisplayed) {
				target.parentNode.classList.remove("error");
				isWarningDisplayed = false;
			}
			characterCounter.firstElementChild.firstChild.data = String(target.value.length);
		} catch(e) { console.error(e) }
	};
}

function createKeypressResetHandler(characterLimit, characterCounter) {
	return event => {
		if (
			event.key !== "Enter" ||
			event.shiftKey ||
			event.target.value.length > characterLimit
		) return;
		characterCounter.firstElementChild.firstChild.data = "0";
	};
}

function createClickResetHandler(characterLimit, characterCounter, textarea) {
	return () => {
		if (textarea.value.length > characterLimit) return;
		characterCounter.firstElementChild.firstChild.data = "0";
	};
}

// "mobile-page-content"
document.getElementById("content").addEventListener("click", ({ target }) => {
	if (
		target.type !== "textarea" ||
		target.__KB_COUNTER_ATTACHED__ ||
		(target.parentNode.classList.contains("_375XK") && !target.classList.contains("kb-chat-input-replacement"))
	) return;
	const textareaForm = target.closest("form");
	const characterLimit = MAX_LENGTH_MAP[target.id] || 256;
	const characterCounter = createCharacterCounter(characterLimit);
	const inputHandler = createInputCounterHandler(characterLimit, characterCounter);
	const keypressHandler = createKeypressResetHandler(characterLimit, characterCounter);
	target.parentNode.appendChild(characterCounter);
	target.addEventListener("input", debounce(inputHandler, 150));
	target.addEventListener("keypress", debounce(keypressHandler, 150));
	target.addEventListener("focusin", inputHandler);
	textareaForm && textareaForm
		.querySelector("button")
		.addEventListener("click", createClickResetHandler(characterLimit, characterCounter, target));
	target.__KB_COUNTER_ATTACHED__ = true;
});