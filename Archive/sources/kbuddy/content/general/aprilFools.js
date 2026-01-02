const currentDate = new Date();

if (
    // First of the month
    currentDate.getDate() === 1
    // Month of April
    && currentDate.getMonth() === 3
    // 1 in 5 chance
    && randomNumber(1, 5) === 3
    // Not executed before
    && sessionStorage.getItem("kb-april-first") !== "uwu"
) {
    const replacementMessage = "uwu";

    const replaceText = (rootNode, replacement) => {
        let node;
        const iterator = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
        while (node = iterator.nextNode()) {
            if (node.data.trim().length > 0) {
                node.data = replacement;
            }
        }
    };

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const addedNode of mutation.addedNodes) {
                replaceText(addedNode, replacementMessage);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    replaceText(document.body, replacementMessage);
    sessionStorage.setItem("kb-april-first", "uwu");
}