let addEnv = document.getElementById("addEnv");
let cleanStorageButton = document.getElementById("cleanStorage");

let environmentSelector = document.getElementById("environmentSelector");
let versionPathSelector = document.getElementById("versionPathSelector");

let defaultUrl = 'defaultURL';
let defaultVersionPath = 'defaultVersionPath';
let urlStorage = 'urlStorage';
let versionStorage = 'versionStorage';

// <----- Dropdown area

/**
 * Clean the dropdown and fill it with fresh data
 */
let initializeEnvironmentList = function (selector, storage, defaultStorage) {
    chrome.storage.local.get([storage], function (result) {
        console.log("[-_-] Adding items to URL list...");

        // noinspection JSAnnotator
        selector.options.length = 0;
        if(result[storage] === undefined) {
            let emptyOption = document.createElement('option');
            emptyOption.text = "Nothing to display";
            selector.add(emptyOption);
        } else {
            for(let i = 0; i < result[storage].length; i++) {
                let option = document.createElement('option');
                option.text = result[storage][i];
                selector.add(option);

                chrome.storage.local.get([defaultStorage], function (result) {
                    selector.value = result[defaultStorage];
                })
            }
        }
    })
};

/**
 * Dropdowns setup
 */
let fillEnvironmentAndVersionList = function () {
    initializeEnvironmentList(environmentSelector, urlStorage, defaultUrl);
    initializeEnvironmentList(versionPathSelector, versionStorage, defaultVersionPath);
};

// Setup dropdowns
fillEnvironmentAndVersionList();

/**
 * Adding event listeners selectors
 * @param element
 * @param storage
 * @param message
 */
let setupChangeEvent = function (element, storage, message) {
    element.addEventListener('change', function (element) {
        console.log("=====Element: ");
        console.log(element.target.value);
        chrome.storage.local.set({[storage]: element.target.value});
        chrome.runtime.sendMessage({[message]: element.target.value});
    });
};

/**
 * Setup events listeners for all selectors
 */
let setupChangeEvents = function () {
    setupChangeEvent(environmentSelector, defaultUrl, "URLChange");
    setupChangeEvent(versionPathSelector, defaultVersionPath, "versionPathChange");
};

// Setup selectors
setupChangeEvents();

// <----- ----->
// <----- Add URL and version path area

/**
 * Add new url or version path block
 */
addEnv.addEventListener('submit', function (element) {
    element.preventDefault();

    let addedUrl = element.target.elements['addUrl'].value;
    let addedVersionPath = element.target.elements['addVersionPath'].value;

    updateStorageWithUrl(urlStorage, addedUrl);
    updateStorageWithUrl(versionStorage, addedVersionPath, true);
});

/**
 * Saves data in chrome storage
 * @param {String} storageLink - where to save
 * @param url - what to save
 * @param {boolean} refresh
 */
let updateStorageWithUrl = function (storageLink, url, refresh) {
    chrome.storage.local.get([storageLink], function (result) {
        if(result[storageLink] && url !== "") {

            let newArrayIf = result[storageLink];
            newArrayIf.push(url);

            chrome.storage.local.set({[storageLink]: newArrayIf})

        } else if(!result[storageLink] && url !== "") {
            let newArrayElse = [url];
            chrome.storage.local.set({[storageLink]: newArrayElse})
        } else console.log("[-_-] Entry field is empty or unknown error while trying to chrome.storage.local.get");

        if(refresh) {
            fillEnvironmentAndVersionList();
        }
    });

};

// <----- ----->
// <----- Clean storage area

/**
 * Clean storage function
 */
let cleanStorage = () => {
    chrome.storage.local.remove(urlStorage);
    chrome.storage.local.remove(versionStorage);
};

/**
 * Clean storage block
 */
cleanStorageButton.addEventListener('submit', function (element) {
    element.preventDefault();
    cleanStorage();
    console.log("[-_-] URL AND VERSION STORAGE'S ARE CLEARED!");
    fillEnvironmentAndVersionList();
});

