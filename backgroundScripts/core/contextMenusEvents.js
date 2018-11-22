import {environment} from "../config/projectProperties.js";
import {commentsCollection} from "../templates/commentsCollection.js";
import {customComments} from "../templates/cutomsComments.js";
import RequestHandler from "./requestHandler.js";

/**
 * Comment constructor
 * @param id
 * @param text
 * @param version
 * @return {*}
 */
// To be moved outside this file
let combineStrings = (id, text, version) => {
    if (id.includes('comment')) {
        return `${text}` +
            `${customComments.comments.devicesStart}${customComments.devices}${customComments.comments.endLine}` +
            `${customComments.comments.environmentURLStart}${environment.defaultEnvironmentURL} | \n` +
            `${customComments.comments.versionStart}${version}${customComments.comments.endLine}`+
            `{panel}`;
    } else {
        return `*STR:*\n# Open ${environment.defaultEnvironmentURL}\n` +
            `${text}` +
            `${customComments.devices}\n` +
            `\n${customComments.description.environmentUrlStart}` +
            `${environment.defaultEnvironmentURL}\n` +
            `${version}`;
    }
};

/**
 * 1. This method connects different menu items to text that will be pasted after click on them
 * 2. Before to post a comment it goes to chrome local storage and takes stringified and cut version.json
 *      and adds it to a comment
 * @param menuId
 * @param text
 */
let addOnClickHandler = ({id, text}) => {
    chrome.contextMenus.onClicked.addListener((menuItem) => {
        if (menuItem.menuItemId !== id) {
            return;
        }

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            RequestHandler.getVersionJSON((parsedVersion) => {
                let result = combineStrings(id, text, parsedVersion);
                chrome.tabs.sendMessage(tabs[0].id, {onClick: result})
            });
        });
    });
};

export default {
    /**
     * Initialize all context menu items
     */
    multipleOnClickedSetup() {
        Object.values(commentsCollection).map((comment) => addOnClickHandler(comment));
    }
};













