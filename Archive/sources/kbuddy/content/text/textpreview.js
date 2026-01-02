console.log("[KoGaMaBuddy] TextPreview Loaded");

const createInputPreviewHandler = panel => ({ target }) => {
	// Check is markdown used is valid enough to display panel (prevent invalid emotes from triggering)
	const isUsingValidMarkdown =
		// Check if markdown is being used at all
		QUOTE_BLOCK_PATTERN.test(target.value) || MARKDOWN_PATTERN.test(target.value)
		// Check if at least one emote is valid, if available; otherwise, markdown is valid
		|| (
			EMOTE_PATTERN.test(target.value)
			&& (
				// heccing regex
				(EMOTE_PATTERN.lastIndex = 0)
				|| [...matchAll(target.value, EMOTE_PATTERN)].some(([, emoteName, emoteStyle ]) => emoteStyle === ':' ? VALID_EMOTES.includes(emoteName) : KOGAMA_EMOTE_MAP.has(emoteName))
			)
		);
	const isPanelOpen = target.hasAttribute("kb-open");
	if (!isPanelOpen && isUsingValidMarkdown) target.setAttribute("kb-open", '');
	else if (isPanelOpen && !isUsingValidMarkdown) target.removeAttribute("kb-open");
	if (isUsingValidMarkdown) {
		QUOTE_BLOCK_PATTERN.lastIndex = MARKDOWN_PATTERN.lastIndex = EMOTE_PATTERN.lastIndex = 0;
		panel.firstChild.innerText = target.value;
	}
};

document.getElementById("mobile-page-content").addEventListener("click", ({ target }) => {
	if (target.type !== "textarea" || target.__KB_PREVIEW_ATTACHED__) return;
	const previewPanel = createElement("div.kb-preview-panel", [ createElement("p") ]);
	const inputPreviewHandler = createInputPreviewHandler(previewPanel);
	target.parentNode.appendChild(previewPanel);
	target.addEventListener("input", debounce(inputPreviewHandler, 300));
	target.addEventListener("focusin", inputPreviewHandler);
	target.__KB_PREVIEW_ATTACHED__ = true;
});