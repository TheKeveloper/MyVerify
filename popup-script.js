const TWITTER_BASE_URL = "https://twitter.com/";
const TWITTER_RESERVED_PATHS = ["home", "explore", "notifications"];

var currentUrl = "";

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    let activeTab = tabs[0];
    currentUrl = activeTab.url;
    onNewUrl(currentUrl);
});

document.getElementById("btn_verify").addEventListener("click",  onVerify);
document.getElementById("btn_unverify").addEventListener("click",  onUnverify);
document.getElementById("txt_verify_alias").addEventListener("keypress", event => {
    if (event.key === "Enter") {
        onVerify();
    }
});

function onNewUrl(url) {
    let user = getTwitterUserFromUrl(url);

    if (user !== null) {
        chrome.storage.sync.get("verified", data => {
            if (data.verified === null || data.verified === undefined || !(user in data.verified)) {
                document.getElementById("div_unverify").hidden = true; 
                document.getElementById("div_verify").hidden = false; 
            } else {
                document.getElementById("div_unverify").hidden = false; 
                document.getElementById("div_verify").hidden = true; 
            }
        })
    }
}

function onVerify() {
    let user = getTwitterUserFromUrl(currentUrl);
    let alias = document.getElementById("txt_verify_alias").value;
    if (alias.trim() === "" || alias === undefined) {
        alias = null; 
    }
    chrome.storage.sync.get("verified", data => {
        let verified = data.verified;
        if (verified === null || verified === undefined) {
            verified = {};
        }
        verified[user] = alias;
        chrome.storage.sync.set({verified}, () => onNewUrl(currentUrl));
    })
}

function onUnverify() {
    let user = getTwitterUserFromUrl(currentUrl);

    chrome.storage.sync.get("verified", data => {
        let verified = data.verified;
        if (verified === null || verified === undefined) {
            verified = {};
        }
        delete verified[user];
        chrome.storage.sync.set({verified}, () => onNewUrl(currentUrl));
    })
}

function getTwitterUserFromUrl(url) {
    if (!url.startsWith(TWITTER_BASE_URL)) {
        return null;
    }
    let path = url.substring(TWITTER_BASE_URL.length);
    if (path.includes("/")) {
        return null;
    }

    if (TWITTER_RESERVED_PATHS.includes(path)) {
        return null;
    } 

    return "@" + path.trim();
}