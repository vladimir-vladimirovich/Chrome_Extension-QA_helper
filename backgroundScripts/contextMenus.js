import {menuCollection} from "./templates/menuCollection.js";

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
 * Call this function to trigger current environment link update in context menu
 */
contextMenus.updateCurrentEnvironment = function () {
    chrome.storage.local.get(["defaultURL"], function (result) {
        if (result.defaultURL === null || result.defaultURL === undefined) {
            result.defaultURL = "";
        }

        chrome.contextMenus.update("QAA", {
            "title": `QAA [${result.defaultURL}]`
        });
    });
};

contextMenus.updateDeviceList = function () {

};

export {contextMenus};