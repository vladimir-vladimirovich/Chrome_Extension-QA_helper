let addEnvUrlForm = document.getElementById('addEnvUrlForm');
let addVersionPathForm = document.getElementById('addVersionPathForm');
let environmentSelector = document.getElementById('environmentSelector');
let versionPathSelector = document.getElementById('versionPathSelector');

let cleanTestUrlStorageButton = document.getElementById('cleanTestUrlStorage');
let cleanStgUrlStorageButton = document.getElementById('cleanStgUrlStorage');
let cleanProdUrlStorageButton = document.getElementById('cleanProdUrlStorage');
let cleanVersionPaths = document.getElementById('cleanVersionPaths');

let deleteSelectedEnvButton = document.getElementById("deleteSelectedEnvButton");
let deleteSelectedVersionButton = document.getElementById("deleteSelectedVersionButton");

let testUrlStorage = "testUrlStorage";
let stgUrlStorage = "stgUrlStorage";
let prodUrlStorage = "prodUrlStorage";

let envSelector = document.getElementsByName('envSelector');
let envInput = document.getElementsByName('envInput');

let defaultUrl = 'defaultURL';
let defaultVersionPath = 'defaultVersionPath';
let versionStorage = 'versionStorage';
let currentEnvironmentGroup = 'currentEnvironmentGroup';

/**
 * Setup events for radio buttons
 */
let setupRadioButtonClickEvents = () => {
    for (let i = 0; i < envSelector.length; i++) {
        envSelector[i].onclick = function () {
            initializeEnvironmentList(environmentSelector, envSelector[i].value, defaultUrl);
        }
    }
};

/**
 * Pull from storage active env group(TEST or STG or PROD) and fill the environment with actual data + version list
 */
let initializeEnvironmentGroup = function () {
    chrome.storage.local.get([currentEnvironmentGroup], function (result) {
        let storage;
        for (let i = 0; i < envSelector.length; i++) {
            if (result.currentEnvironmentGroup === envSelector[i].value) {
                envSelector[i].checked = true;
                storage = envSelector[i].value;
            }
        }

        initializeEnvironmentList(environmentSelector, storage, defaultUrl);
        initializeEnvironmentList(versionPathSelector, versionStorage, defaultVersionPath);
    });
};

initializeEnvironmentGroup();
setupRadioButtonClickEvents();

/**
 * returns active radio button from group
 * @param element
 * @return {string|Number|*}
 */
let getCheckedRadioButton = (element) => {
    for (let i = 0; i < element.length; i++) {
        if (element[i].checked) {
            console.log("Active env: " + element[i].value);
            return element[i].value;
        } else console.log("There are no checked radio button in environment adding area");
    }
};

/**
 * Clean the dropdown and fill it with fresh data
 * @param {Element} selector - point to selector you want to fill with data
 * @param {String} storage - points to storage from where the data is taken
 * @param {String} defaultStorage - pointer to currently active URL which is selected automatically
 */
let initializeEnvironmentList = function (selector, storage, defaultStorage) {
    chrome.storage.local.get([storage], function (result) {
        console.log("[-_-] Adding items to URL list...");
        selector.options.length = 0;
        if (result[storage] === undefined) {
            let emptyOption = document.createElement('option');
            emptyOption.text = "Nothing to display";
            selector.add(emptyOption);
        } else {
            for (let i = 0; i < result[storage].length; i++) {
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
 * Adding event listeners
 * @param element
 * @param storage
 * @param message
 * @param updateContextMenu
 */
let setupChangeEvent = function (element, storage, message, updateContextMenu) {
    element.addEventListener('change', function (element) {
        let activeEnv = getCheckedRadioButton(envSelector);
        chrome.storage.local.set({[storage]: element.target.value});
        chrome.runtime.sendMessage({[message]: element.target.value});

        chrome.storage.local.set({[currentEnvironmentGroup]: activeEnv});

        if (updateContextMenu) {
            chrome.contextMenus.update("CPH", {
                "title": `CPH: [${element.target.value}]`
            });
        }
    });
};

let setupSubmitEvent = () => {
    /**
     * Add new url or version path block
     */
    addEnvUrlForm.addEventListener('submit', function (element) {
        element.preventDefault();

        let addedUrl = element.target.elements['addUrl'].value;
        let inputEnv = getCheckedRadioButton(envInput);
        let selectorEnv = getCheckedRadioButton(envSelector);

        updateStorageWithUrl(inputEnv, addedUrl, () => {
            if (inputEnv === selectorEnv) {
                initializeEnvironmentList(environmentSelector, inputEnv, defaultUrl);
            }
        });

    });

    addVersionPathForm.addEventListener('submit', function (element) {
        element.preventDefault();

        let addedVersionPath = element.target.elements['addVersionPath'].value;

        updateStorageWithUrl(versionStorage, addedVersionPath);

        updateStorageWithUrl(versionStorage, addedVersionPath, () => {
            initializeEnvironmentList(versionPathSelector, versionStorage, defaultVersionPath);
        });
    });
};

/**
 * Setup click events for clean storage buttons
 */
let setupButtonClickEvents = () => {
    setupButtonClickEvent(cleanTestUrlStorageButton, testUrlStorage, function () {
        initializeEnvironmentList(environmentSelector, testUrlStorage, defaultUrl)
    });
    setupButtonClickEvent(cleanStgUrlStorageButton, stgUrlStorage, function () {
        initializeEnvironmentList(environmentSelector, stgUrlStorage, defaultUrl)
    });
    setupButtonClickEvent(cleanProdUrlStorageButton, prodUrlStorage, function () {
        initializeEnvironmentList(environmentSelector, prodUrlStorage, defaultUrl)
    });
    setupButtonClickEvent(cleanVersionPaths, versionStorage, function () {
        initializeEnvironmentList(versionPathSelector, versionStorage, defaultVersionPath);
    });

    deleteSelectedEnvButton.addEventListener('click', function () {
        removeSelectorValue(environmentSelector, 'environment');
    });
    deleteSelectedVersionButton.addEventListener('click', function () {
        removeSelectorValue(versionPathSelector, 'version');
    });
};

/**
 * Setup events for clean storage button
 * @param button
 * @param storageUrl
 * @param callback
 */
let setupButtonClickEvent = (button, storageUrl, callback) => {
    button.addEventListener('click', function (element) {
        element.preventDefault();
        cleanStorage(storageUrl, function () {
            callback();
        });
        console.log("Following storage is cleaned: " + storageUrl);
    });
};

/**
 * Saves data in chrome storage
 * @param {String} storageLink - where to save
 * @param {String} url - what to save
 * @param callback
 */
let updateStorageWithUrl = function (storageLink, url, callback) {
    chrome.storage.local.get([storageLink], function (result) {
        if (result[storageLink] && url !== "") {
            let newArrayIf = result[storageLink];
            newArrayIf.push(url);
            chrome.storage.local.set({[storageLink]: newArrayIf})
        } else if (!result[storageLink] && url !== "") {
            let newArrayElse = [url];
            chrome.storage.local.set({[storageLink]: newArrayElse})
        } else console.log("[-_-] Entry field is empty or unknown error while trying to chrome.storage.local.get");

        if (callback) {
            callback();
        }
    });
};

/**
 * Clean storage function
 */
let cleanStorage = (storage, callback) => {
    chrome.storage.local.remove(storage, function () {
        callback();
    });
};


/**
 * Removes values from selector and saves result into storage
 * @param {Element} selectorList
 * @param {String} selectorType
 */
let removeSelectorValue = (selectorList, selectorType) => {
    // Remove current selected value
    selectorList.options[selectorList.selectedIndex].remove();

    // Array of objects of options from selector
    let optionsArray = Object.values(selectorList);

    // New array of string values
    let newOptionsValuesArray = optionsArray.map(function (optionsArray) {
        return optionsArray.value;
    });

    // Saves remaining options into selected environment group storage or version storage
    if (selectorType === 'environment') {
        let currentEnvGroup = getCheckedRadioButton(envSelector);
        chrome.storage.local.set({[currentEnvGroup]: newOptionsValuesArray})
    } else if (selectorType === 'version') {
        chrome.storage.local.set({[versionStorage]: newOptionsValuesArray})
    }
};

/**
 * Setup events listeners for all selectors
 */
let setupEvents = function () {
    setupChangeEvent(environmentSelector, defaultUrl, 'URLChange', true);
    setupChangeEvent(versionPathSelector, defaultVersionPath, 'versionPathChange');
    setupSubmitEvent();
    setupButtonClickEvents();
};

// Setup everything
setupEvents();
