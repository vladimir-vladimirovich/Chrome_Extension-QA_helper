import {environment} from "../config/projectProperties.js";

/**
 * Listener for environment URL update
 */
chrome.runtime.onMessage.addListener((request) => {
    if(request.URLChange) {
        environment.defaultEnvironmentURL = request.URLChange;
    }

    if(request.versionPathChange) {
        environment.defaultFEJSONPass = request.versionPathChange;
    }
});

/**
 * Check if there is default URL set in storage and if it is - use it
 */
export let checkDefaultURL = () => {
    chrome.storage.local.get(['defaultURL'], function (result) {
        console.log("checking storage...");
        if(result.defaultURL) {
            console.log("result.defaultURL: " + result.defaultURL);
            environment.defaultEnvironmentURL = result.defaultURL;
        }
    });

    chrome.storage.local.get(['defaultVersionPath'], function (result) {
        console.log("checking storage...");
        if(result.defaultVersionPath) {
            console.log("result.defaultVersionPath: " + result.defaultVersionPath);
            environment.defaultFEJSONPass = result.defaultVersionPath;
        }
    })
};
