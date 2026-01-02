window.addEventListener("beforeunload", event => {
	const activeTextarea = [...document.getElementsByTagName("textarea")]
		.find(el => el.value.length !== 0 && activeTextarea.id !== "description");
	if (typeof activeTextarea !== "undefined") {
		event.preventDefault();
		activeTextarea.focus();
	}
});