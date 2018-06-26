import {environment} from "../config/projectProperties.js";
import {commentsCollection} from "../templates/commentsCollection.js";
import {customComments} from "../templates/cutomsComments.js";

/**
 * Comment constructor
 * @param menuId
 * @param text
 * @param version
 * @return {*}
 */
let combineStrings = function (menuId, text, version) {
    if (menuId.includes('comment')) {
        return text + customComments.commentVersionStart + version + customComments.commentVersionEnd;
    } else {
        return text + environment.defaultEnvironmentURL + '\n' + version;
    }
};

let contextMenusEvents = {};

/**
 * 1. This method connects different menu items to text that will be pasted after click on them
 * 2. Before to post a comment it goes to chrome local storage and takes stringified and cut version.json
 *      and adds it to a comment
 * @param menuId
 * @param text
 */
contextMenusEvents.onClicked = function (menuId, text) {
    chrome.contextMenus.onClicked.addListener(function (menuItem) {
        if (menuItem.menuItemId !== menuId) {
            return;
        }
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            let cb = function (version) {
                let result = combineStrings(menuId, text, version.versionJSON);
                chrome.tabs.sendMessage(tabs[0].id, {onClick: result})
            };

            chrome.storage.local.get(['versionJSON'], cb);
        });
    });
};

/**
 * Initialize all context menu items
 */
contextMenusEvents.multipleOnClickedSetup = () => {
    Object.values(commentsCollection).map((t) => {
        contextMenusEvents.onClicked(t.id, t.text)
    });
};

export {contextMenusEvents}













