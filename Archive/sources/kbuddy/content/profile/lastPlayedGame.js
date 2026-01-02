if (isClientProfile && typeof localStorage.getItem("__amplify__cache:game:last-played") !== "undefined") {
    const createGameCard = (game) => {
        return createElement("li.game-item", {
            style: "width: 100%;"
        }, [
            createElement("a", {
                href: `/games/play/${game.id}/`,
                style: "max-width: unset; max-height: 170px; overflow: hidden;"
            }, [
                createElement("div.game-image", {
                    style: `background-image: url(https:${game.images.medium})`
                }),
                createElement("div.game-name-stats", [
                    createElement("div.game-name", decodeEntities(game.name)),
                    createElement("ul.game-stats", [
                        createElement("li.game-likes", [
                            createElement("span.data.tool-top", {
                                "data-placement": "top",
                                "data-original-title": "Likes"
                            }, [
                                createElement("i.icon-gamepad"),
                                " " + game.likes.toLocaleString("fr-FR")
                            ])
                        ]),
                        createElement("li.game-played", [
                            createElement("span.data.tool-top", {
                                "data-placement": "top",
                                "data-original-title": "Play count"
                            }, [
                                createElement("i.icon-gamepad"),
                                " " + game.played.toLocaleString("fr-FR")
                            ])
                        ])
                    ])
                ])
            ])
        ])
    };

    const gameData = JSON.parse(localStorage.getItem("__amplify__cache:game:last-played")).data;
    document.querySelector(".creations-custom").appendChild(
        createElement("div.section-description", [
            createElement("div.description-container", {
                style: "max-height: unset;"
            }, [
                createElement("div.header", "Last Played Game"),
                createElement("ul.games-list", {
                    style: "padding: 4px 10px 8px; margin: 0;"
                }, [ createGameCard(gameData) ])
            ])
        ])
    );
}