var verified = {};
async function main() {
    const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === 1) {
                replaceVerified(verified)
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
    users.filter(user => user.handleText in verifiedMap).forEach(user => {
        user.displayName.style.color = "green";
        const alias = verifiedMap[user.handleText]
        if (alias !== null) {
            user.displayName.innerText = alias;
        }
    });
}

function findUsers() {
    return [...findTopLevelUsers(), ...findUserPageUsers(), ...findQuoteReplyUsers()];
}

function findUserPageUsers() {
    return Array.from(document.querySelectorAll("[data-testid='UserName']")).map(elt => {return {
        handleText: elt.getElementsByTagName("span")[3].innerText.toString(),
        displayName: elt.getElementsByTagName("span")[1]
    }});
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
    return Array.from(document.querySelectorAll(`div[data-testid="UserAvatar-Container-unknown"]`))
        .filter(elt => elt.parentElement.getElementsByTagName("span").length !== 0)
        .map(elt => {
            return {
                handleText: elt.parentElement.parentElement.parentElement.parentElement.getElementsByTagName("span")[2].innerText.toString(),
                displayName: elt.parentElement.getElementsByTagName("span")[0]
            }
        })
}

function getDisplayNameSpan(usernameDiv) {
    return usernameDiv.children[0].getElementsByTagName("span")[0];
}

function getHandleSpan(usernameDiv) {
    return usernameDiv.children[1].getElementsByTagName("span")[0];
}

chrome.storage.sync.get(['verified'], function(result) {
    if (result.verified !== null && result.verified !== undefined) {
        verified = result.verified;
    }
    main();
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    if ("verified" in namespace) {
        let { _, newValue } = namespace.verified;
        verified = newValue;
    }
  });

main();

