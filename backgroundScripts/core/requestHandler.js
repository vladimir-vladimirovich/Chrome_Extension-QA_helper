import {environment} from "../config/projectProperties.js";

let requests = {};

/**
 * 1. Sends AJAX request
 * 2. Writes STRINGIFIED result in local storage
 * @param callback - ability to work with request result parsed by JSON.parse()
 */
requests.getVersionJSON = function (callback) {
    let xhr = new XMLHttpRequest();

    // Set connection options
    xhr.open('GET', environment.defaultEnvironmentURL + environment.defaultFEJSONUrl, true);

    // Actions to be performed on load
    xhr.onload = function () {
        let versionJSON = JSON.parse(xhr.responseText);

        // Delete unnecessary property: commit log
        delete versionJSON.WPL_Git_Log;

        callback.call(versionJSON);

        // Stringify parsed json
        let resultString = '';
        for(let prop in versionJSON) {
            resultString = resultString + prop + ": " + versionJSON[prop] +  '\n';
        }

        // Save stringified version.json into extension storage
        chrome.storage.local.set({'versionJSON': resultString}, function () {
            console.log("[-_-] Local storage updated with stringified version.json");
        })
    };

    // ERROR handler
    xhr.onerror = function() {
        console.log( '[-_-] XMLHttpRequest ERROR: ' + this.status );
    };

    // Send request
    xhr.send()
};

export {requests}