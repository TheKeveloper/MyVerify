var verified = {};
async function main() {
    const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                // slightly reduce the number of modifications to the DOM
                if (node.nodeType === Node.ELEMENT_NODE && node.parentElement !== null && node.textContent.includes("@")) {
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
    console.log("replaceVerified called"); 
    let users = findUsers();
    users.forEach(user => {
        if (user.handleText in verifiedMap) {
            user.displayName.style.color = "green";
            const alias = verifiedMap[user.handleText]
            if (alias !== null) {
                user.displayName.innerText = alias;
            }
        } else if (user.displayName.style.color === "green") {
            user.displayName.style.color = "black";
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
    if ("verified" in changes) {
        let { oldValue, newValue } = changes.verified;

        verified = newValue;

        if (Object.keys(oldValue).length < Object.keys(newValue).length) {
            replaceVerified(verified);
        } else {
            location.reload();
        }
    }
  });

main();

