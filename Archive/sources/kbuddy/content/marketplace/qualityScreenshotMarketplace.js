console.log("[KoGaMaBuddy] QualityScreenshot.Marketplace loaded");

const ITEM_PAGE = /^\/marketplace\/(?:model|avatar)\/[ia]-\d+\/$/;

if (!ITEM_PAGE.test(location.pathname)) {
	// Helper Functions
	const getHQImageURL = url => {
		return url.includes("placeholder")
			? "https:" + url.slice(5, -2)
			.replace("medium_64x64", "large_330x451")
			.replace("medium_350x194", "large_600x240")
			: `https:${url.slice(5, -14).replace("cache","images")}.png`;
	};
	const appendCameraIcon = (targetSelector, targetType) => {
		for (const el of document.querySelectorAll(targetSelector)) {
			el.appendChild(
				createElement("a", {
					href: getHQImageURL(el.style["background-image"]),
					target: "_blank"
				}, [
					createElement(`i.icon-camera.kb-camera.${targetType}`)
				])
			);
		}
	};
	const createDynamicIconAppender = (rootSelector, targetSelector, targetType) => {
		const rootNode = document.querySelector(rootSelector);
		const observer = new MutationObserver(mutations => {
			for (const record of mutations) {
				for (const node of record.addedNodes) {
					if (node !== rootNode.firstElementChild) continue;
					appendCameraIcon(targetSelector, targetType);
					break;
				}
			}
		});
		observer.observe(rootNode, { childList: true });
		appendCameraIcon(targetSelector, targetType);
	};
	// Start!
	createDynamicIconAppender("#mobile-page", ".shop-image", "marketplace");
}