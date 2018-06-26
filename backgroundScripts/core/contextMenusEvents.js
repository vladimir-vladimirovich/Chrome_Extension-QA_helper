import {environment} from "../config/projectProperties.js";
import {commentsCollection} from "../templates/commentsCollection.js";

// var inner = {
let commentVersionStart = ' |\n' +
    '| *Version stamp:* | ';
let commentVersionEnd = ' |\n' +
    '{panel}';

/**
 * Comment constructor
 * @param menuId
 * @param text
 * @param version
 * @return {*}
 */
let combineStrings = function (menuId, text, version) {
    if (menuId.includes('comment')) {
        return text + environment.defaultEnvironmentURL + commentVersionStart + version + commentVersionEnd;
    } else {
        return text + environment.defaultEnvironmentURL + '\n' + version;
    }
};
// };

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


        // if (menuItem.menuItemId === menuId) {
        //     chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        //         chrome.storage.local.get(['versionJSON'], function (version) {
        //             var result = combineStrings(menuId, text, version.versionJSON);
        //             chrome.tabs.sendMessage(tabs[0].id, {onClick: result})
        //         });
        //     })
        // }
    });
};

/**
 * Initialize all context menu items
 */
contextMenusEvents.multipleOnClickedSetup = function () {
    let array = Object.values(commentsCollection);
    array.forEach(function (t) {
        this.onClicked(t.id, t.text)
    }.bind(this));
};

// contextMenusEvents.multipleOnClickedSetup = () => {
//     Object.values(commentsCollection).map((t) => {
//         this.onClicked(t.id, t.text)
//     });
// };

export {contextMenusEvents}













