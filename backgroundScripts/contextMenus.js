import {menuCollection} from "./templates/menuCollection.js";
import envManagerData from "./data/envManagerData.js";

let contextMenus = {};

/**
 * Default chrome extension way to add item to context menu
 * @param {Object} menuItem
 */
contextMenus.addMenuItem = (menuItem) => {
    chrome.contextMenus.create(menuItem);
};

/**
 * 1. Transforms object to array
 * 2. Walking through array and adding items to context menu
 */
contextMenus.addMultipleItems = function () {
    let array = Object.values(menuCollection);
    array.map((t) => {
        this.addMenuItem(t)
    })
};

/**
 * Call this function to trigger current projectProperties link update in context menu
 */
contextMenus.updateCurrentEnvironment = function () {
    chrome.storage.local.get(envManagerData.storage.activeEnvironment, function (result) {
        if (
            result[envManagerData.storage.activeEnvironment] === null
            || result[envManagerData.storage.activeEnvironment] === undefined
        ) {
            result[envManagerData.storage.activeEnvironment] = "";
        }

        chrome.contextMenus.update("QAA", {
            "title": `QAA [${result[envManagerData.storage.activeEnvironment]}]`
        });
    });
};

contextMenus.updateDeviceList = function () {

};

export {contextMenus};