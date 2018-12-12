let currentEnvironmentGroup = 'currentEnvironmentGroup';
let defaultUrl = 'defaultURL';
let defaultVersionPath = 'defaultVersionPath';
let versionStorage = 'versionStorage';

let environmentGroupRadio = document.getElementsByName('environmentGroupRadio');

let environmentSelector = document.getElementById('environmentSelector');
let deleteSelectedEnvButton = document.getElementById("deleteSelectedEnvButton");
let addEnvironment = document.getElementById('addEnvironment');

let versionPathSelector = document.getElementById('versionPathSelector');
let deleteSelectedVersionButton = document.getElementById("deleteSelectedVersionButton");
let addVersion = document.getElementById('addVersion');

let testUrlStorage = "testUrlStorage";
let stgUrlStorage = "stgUrlStorage";
let prodUrlStorage = "prodUrlStorage";

/**
 * Pull from storage active env group(TEST or STG or PROD) and fill the environment with actual data + version list
 */
let initializeEnvironmentGroup = function () {
    chrome.storage.local.get([currentEnvironmentGroup], function (result) {
        let storage;
        for (let i = 0; i < environmentGroupRadio.length; i++) {
            if (result.currentEnvironmentGroup === environmentGroupRadio[i].value) {
                $(environmentGroupRadio[i]).parent().addClass('active');
                storage = environmentGroupRadio[i].value;
            }
        }

        setupDropdown(environmentSelector, storage, defaultUrl);
        setupDropdown(versionPathSelector, versionStorage, defaultVersionPath);
    });
};

/**
 * Clean the dropdown and fill it with fresh data
 * @param {Element} selector - point to selector you want to fill with data
 * @param {String} storage - points to storage from where the data is taken
 * @param {String} defaultStorage - pointer to currently active URL which is selected automatically
 */
let setupDropdown = function (selector, storage, defaultStorage) {
    chrome.storage.local.get([storage], function (result) {
        selector.options.length = 0;
        if (result[storage] === undefined) {
            let emptyOption = document.createElement('option');
            emptyOption.text = 'Nothing to display';
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
 * Setup click events for clean storage buttons
 */
let setupEnvironmentEvents = function () {
    $(deleteSelectedEnvButton).click(function () {
        let currentEnvGroup = getCheckedRadioValue(environmentGroupRadio);
        removeSelectorValue(environmentSelector, currentEnvGroup)
    });

    $(deleteSelectedVersionButton).click(function () {
        removeSelectorValue(versionPathSelector, versionStorage)
    });

    $(addEnvironment).click(function (eventObject) {
        updateStorageWithValue(eventObject, defaultUrl)
    });

    $(addVersion).click(function (eventObject) {
        updateStorageWithValue(eventObject, versionStorage)
    });

    setupDropdownChangeEvent(environmentSelector, defaultUrl, 'URLChange');
    setupDropdownChangeEvent(versionPathSelector, defaultVersionPath, 'versionPathChange');

    setupRadioButtonChange(environmentGroupRadio);
};

/**
 * 1. Selected value in drop down will set as default
 * 2. Change radio button that will be selected by default after pop up open
 * @param element
 * @param defaultStorage
 * @param {string} message - URLChange, versionPathChange. In order to update input from context menu
 */
let setupDropdownChangeEvent = function (element, defaultStorage, message) {
    $(element).change(function (eventObject) {
        chrome.storage.local.set({[defaultStorage]: eventObject.target.value});
        chrome.runtime.sendMessage({[message]: eventObject.target.value});

        let activeEnv = getCheckedRadioValue(environmentGroupRadio);
        chrome.storage.local.set({[currentEnvironmentGroup]: activeEnv});
    })
};

/**
 * Updates environment drop down during radio[TST, STG, PROD] change accordingly
 * @param {element} radioGroup
 */
let setupRadioButtonChange = (radioGroup) => {
    $(radioGroup).change(function (eventObject) {
        setupDropdown(environmentSelector, eventObject.target.value, defaultUrl);
    })
};

/**
 * Update storage with value from input field
 * @param dropdownElement - drop down to be updated right after adding new item
 * @param storage
 */
let updateStorageWithValue = (dropdownElement, storage) => {
    let currentStorage;
    let dropdown;

    if (storage === defaultUrl) {
        currentStorage = getCheckedRadioValue(environmentGroupRadio);
        dropdown = environmentSelector;
    } else {
        currentStorage = versionStorage;
        dropdown = versionPathSelector;
    }

    let newItem = $(dropdownElement.target).parent().parent().find('.form-control')[0].value;

    chrome.storage.local.get([currentStorage], function (result) {
        if (result[currentStorage] && newItem !== "") {
            let newArrayIf = result[currentStorage];
            newArrayIf.push(newItem);
            chrome.storage.local.set({[currentStorage]: newArrayIf})
        } else if (!result[currentStorage] && newItem !== "") {
            let newArrayElse = [newItem];
            chrome.storage.local.set({[currentStorage]: newArrayElse})
        } else console.log("[-_-] Entry field is empty or unknown error while trying to chrome.storage.local.get");

        setupDropdown(dropdown, currentStorage, storage);

    })
};

/**
 * Removes values from selector and saves result into storage
 * @param {Element} selectorList
 * @param storage
 */
let removeSelectorValue = (selectorList, storage) => {
    // Remove current selected value
    selectorList.options[selectorList.selectedIndex].remove();

    // Array of objects of options from selector
    let optionsArray = Object.values(selectorList);

    // Pre filter in order to remove event object
    optionsArray = optionsArray.filter(filteredArray => filteredArray.value);

    // New array of string values
    let newOptionsValuesArray = optionsArray.map(function (opt) {
        return opt.value;
    });

    if (newOptionsValuesArray[0] === undefined) {
        chrome.storage.local.remove([storage])
    } else {
        chrome.storage.local.set({[storage]: newOptionsValuesArray});
    }
};

/**
 * returns active radio button from group
 * @param element
 * @return {string|Number|*}
 */
let getCheckedRadioValue = function (element) {
    return $(element).parent('.active')[0].children[0].value;
};

export {initializeEnvironmentGroup, setupEnvironmentEvents}