import { menuCollection } from "./templates/menuCollection.js";

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
 * @param {Object} menusObject
 */
contextMenus.addMultipleItems = function () {
    let array = Object.values(menuCollection);
    // array.forEach(function (t) {
    //     this.addMenuItem(t)
    // }.bind(this))
    // Improvement
    array.map((t) => {this.addMenuItem(t)})
};

export {contextMenus};