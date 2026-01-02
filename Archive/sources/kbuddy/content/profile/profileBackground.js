const BACKGROUND_PATTERN = /background:\s*(\d+)(?:,\s*filter:\s*(light|dark|blur|none))?;/i;
const sectionTopBackground = document.querySelector(".section-top-background");

if (typeof sectionTopBackground !== "undefined") {
    const getImageURL = url => `https:${url.replace("cache","images").slice(0, -12)}.png`;
    const backgroundDetails = BACKGROUND_PATTERN.exec(pageData.object.description);
    if (Array.isArray(backgroundDetails)) {
        const [, gameID, filter = "light" ] = backgroundDetails;
        sectionTopBackground.firstElementChild.style.backgroundImage = "none";
        fetchJSON(`/game/published/?q=${gameID}`).then(game => {
           switch (filter.toLowerCase()) {
               case "light":
                   sectionTopBackground.firstElementChild.style.backgroundImage = `url(${getImageURL(game.images.medium)})`;
                   break;
               case "dark":
                   sectionTopBackground.style.backgroundImage = "none";
                   sectionTopBackground.firstElementChild.style.backgroundImage = `url(${getImageURL(game.images.medium)})`;
                   break;
               case "blur":
                   sectionTopBackground.style.backgroundImage = "none";
                   sectionTopBackground.firstElementChild.style.opacity = "unset";
                   sectionTopBackground.firstElementChild.style.backgroundImage = `url(${getImageURL(game.images.medium)})`;
                   break;
               case "none":
                   sectionTopBackground.style.backgroundImage = "none";
                   sectionTopBackground.firstElementChild.style.filter = "none";
                   sectionTopBackground.firstElementChild.style.opacity = "unset";
                   sectionTopBackground.firstElementChild.style.backgroundImage = `url(${getImageURL(game.images.medium)})`;
                   break;
           }
        });
    }
}