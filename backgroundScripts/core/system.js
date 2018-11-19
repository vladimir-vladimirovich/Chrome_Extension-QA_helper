import {environment} from "../config/projectProperties.js";
import {contextMenus} from "../contextMenus.js"
import {customComments} from "../templates/cutomsComments.js";

let checkDefaultURL = () => {
    chrome.storage.local.get(['defaultURL'], function (result) {
        console.log("checking storage...");
        if (result.defaultURL) {
            console.log("result.defaultURL: " + result.defaultURL);
            environment.defaultEnvironmentURL = result.defaultURL;
        }
    });

    chrome.storage.local.get(['defaultVersionPath'], function (result) {
        console.log("checking storage...");
        if (result.defaultVersionPath) {
            console.log("result.defaultVersionPath: " + result.defaultVersionPath);
            environment.defaultFEJSONPass = result.defaultVersionPath;
        }
    })
};

let formatDevicesArrayToString = function(devicesArray) {
    let formattedDeviceList = " ";
    for (let i = 0; i < devicesArray.length; i++) {
        // Do not set '\n' on last string
        if (i === devicesArray.length - 1) {
            formattedDeviceList = formattedDeviceList + "- " + devicesArray[i]
        } else formattedDeviceList = formattedDeviceList + "- " + devicesArray[i] + '\n';
    }

    return formattedDeviceList;
};

/**
 * Check if there are selected devices already. If so - you them
 */
let checkDefaultDevicesList = () => {
    chrome.storage.local.get(['selectedDevicesStorage'], function (result) {
        if(!result.selectedDevicesStorage !== undefined) {
            customComments.devices = formatDevicesArrayToString(result.selectedDevicesStorage);
        }
    })
};

/**
 * Check if there is default URL set in storage and if it is - use it
 */
export default {
    init() {
        //Listener for environment URL update
        chrome.runtime.onMessage.addListener((request) => {
            if (request.URLChange) {
                environment.defaultEnvironmentURL = request.URLChange;
            }

            if (request.versionPathChange) {
                environment.defaultFEJSONPass = request.versionPathChange;
            }

            if (request.deviceListChange) {
                // Update template
                customComments.devices = formatDevicesArrayToString(request.deviceListChange);
            }

            contextMenus.updateCurrentEnvironment();
        });

        checkDefaultURL();
        checkDefaultDevicesList();
    }
}
