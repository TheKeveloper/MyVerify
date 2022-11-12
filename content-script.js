
async function main() {
    const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === 1) {
                replaceVerified({})
                return;
              }
            }
          }
    });
    observer.observe(document, {
        childList: true,
        subtree: true,
    });
}

function replaceVerified(verifiedMap) {
    let users = findUsers();
    console.log(users);
    users.filter(user => user.handleText in verifiedMap).forEach(user => {
        user.displayName.style.color = "green";
        const alias = verifiedMap[user.handleText]
        if (alias !== null) {
            user.displayName.innerText = alias;
        }
    });
}

function findUsers() {
    return findTopLevelUsers();
}

function findTopLevelUsers() {
    return Array.from(document.querySelectorAll(`div[data-testid="User-Names"]`)).map(elt => {
        return {
            handleText: getHandleSpan(elt).innerText.toString(),
            displayName: getDisplayNameSpan(elt)
        }
    });
}

function findQuoteReplyUsers() {
    // TODO: implement
    return [];
}

function getDisplayNameSpan(usernameDiv) {
    return usernameDiv.children[0].getElementsByTagName("span")[0];
}

function getHandleSpan(usernameDiv) {
    return usernameDiv.children[1].getElementsByTagName("span")[0];
}

main();

