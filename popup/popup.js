let form = document.getElementById("environment");

form.addEventListener('submit', function (element) {
    element.preventDefault();

    console.log("New URL: " + element.target.elements['url'].value);

    let newURL = element.target.elements['url'].value;

    chrome.storage.local.set({defaultURL: newURL});

    chrome.runtime.sendMessage({URLChange: newURL});
});