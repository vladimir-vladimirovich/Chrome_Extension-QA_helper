import {projectProperties} from "../config/projectProperties.js";
import {contextMenus} from "../contextMenus.js"
import {customComments} from "../templates/cutomsComments.js";

let activeTemplateStorage = 'activeTemplateStorage';
let templatesStorage = 'templatesStorage';

let checkDefaultURL = () => {
    chrome.storage.local.get(['defaultURL'], function (result) {
        console.log("checking storage...");
        if (result.defaultURL) {
            console.log("result.defaultURL: " + result.defaultURL);
            projectProperties.defaultEnvironmentURL = result.defaultURL;
        }
    });
    chrome.storage.local.get(['defaultVersionPath'], function (result) {
        console.log("checking storage...");
        if (result.defaultVersionPath) {
            console.log("result.defaultVersionPath: " + result.defaultVersionPath);
            projectProperties.defaultFEJSONPass = result.defaultVersionPath;
        }
    });
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
        console.log('***** result.selectedDevicesStorage');
        console.log(result.selectedDevicesStorage);
        if(result.selectedDevicesStorage !== undefined) {
            customComments.devices = formatDevicesArrayToString(result.selectedDevicesStorage);
        }
    })
};

/**
 * Check if there is default URL set in storage and if it is - use it
 */
export default {
    init() {
        //Listener for projectProperties URL update
        chrome.runtime.onMessage.addListener((request) => {
            if (request.URLChange) {
                projectProperties.defaultEnvironmentURL = request.URLChange;
            }
            if (request.versionPathChange) {
                projectProperties.defaultFEJSONPass = request.versionPathChange;
            }
            if (request.deviceListChange) {
                // Update template
                customComments.devices = formatDevicesArrayToString(request.deviceListChange);
            }
            contextMenus.updateCurrentEnvironment();
        });
        // // Listen to hot keys pressed in content scripts
        // // Send active template details to content scripts in response
        // chrome.runtime.onMessage.addListener(function (message) {
        //     if (message.getActiveTemplate) {
        //         chrome.storage.local.get(activeTemplateStorage, function (resultActive) {
        //             chrome.storage.local.get(templatesStorage, function (resultTemplates) {
        //                 // Send response with data from active template
        //                 // Send message to currently active tab
        //                 chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        //                     chrome.tabs.sendMessage(tabs[0].id,
        //                         {setActiveTemplate: resultTemplates.templatesStorage[resultActive.activeTemplateStorage]});
        //                 });
        //             })
        //         })
        //     }
        // });
        checkDefaultURL();
        checkDefaultDevicesList();
    }
}