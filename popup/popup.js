let form = document.getElementById("environment");

form.addEventListener('submit', function (element) {
    element.preventDefault();

    console.log("New URL: " + element.target.elements['url'].value);

    let newURL = element.target.elements['url'].value;
    let versionPath = element.target.elements['versionPath'].value;

    chrome.storage.local.set({defaultURL: newURL});
    chrome.storage.local.set({defaultVersionPath: versionPath});

    chrome.runtime.sendMessage({URLChange: newURL});
    chrome.runtime.sendMessage({versionPathChange: versionPath});
});