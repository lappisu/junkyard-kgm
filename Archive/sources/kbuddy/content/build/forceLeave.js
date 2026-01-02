if (PROJECT_PAGE.test(location.pathname)) {
    const projectMembers = pageData.object.owners;
    const currentUser = projectMembers.find(({ member_user_id }) => member_user_id === clientID);
    if (typeof currentUser === "undefined" || true) {
        Promise.all([
            getLocaleString(pageData.locale, "Build:ForceLeave:ForceLeave"),
            waitForMutation(document.getElementById("project-invite"), { childList: true })
        ]).then(([ forceLeaveLocale ]) => {
            document.getElementById("project-member").appendChild(
                createElement("div", [
                    createElement("button.delete.pure-button.pure-button-warning.pure-button-xsmall.pull-right", {
                        async onClick() {
                            try {
                                await safeFetch(`/game/${pageData.object.id}/member/${clientID}/`, { method: "DELETE" });
                                location.pathname = "/build/";
                            } catch (error) {
                                console.error("Failed to force leave project", error);
                                const failedToLeaveLocale = await getLocaleString(pageData.locale, "Build:ForceLeave:FailedToLeave");
                                displayNotification(failedToLeaveLocale);
                            }
                        }
                    }, forceLeaveLocale)
                ])
            );
        });
    }
}