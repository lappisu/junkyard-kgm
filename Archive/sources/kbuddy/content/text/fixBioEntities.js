console.log("[KoGaMaBuddy] Fixing bio entities");

const profileEditArticle = document.getElementById("profile-edit");
if (typeof profileEditArticle !== "undefined") {
    waitForMutation(profileEditArticle, { childList: true, subtree: true }).then(() => {
        const descriptionTextarea = document.getElementById("description");
        descriptionTextarea.value = decodeEntities(descriptionTextarea.value);
    });
}