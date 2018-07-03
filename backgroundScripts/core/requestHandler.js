import {environment} from "../config/projectProperties.js";

let requestHandler = {};

/**
 * 1. Sends AJAX request
 * 2. Writes STRINGIFIED result in local storage
 * @param callback - ability to work with request result parsed by JSON.parse()
 */
requestHandler.getVersionJSON = function (callback) {
    let xhr = new XMLHttpRequest();

    // Set connection options
    xhr.open('GET', environment.defaultEnvironmentURL + environment.defaultFEJSONPass, true);

    // Actions to be performed on load
    xhr.onload = () => {
        let versionJSON = JSON.parse(xhr.responseText);

        // Delete unnecessary property: commit log
        delete versionJSON.WPL_Git_Log;

        // Stringify parsed json
        let resultString = '';
        for(let prop in versionJSON) {
            resultString = resultString + prop + ": " + versionJSON[prop] +  '\n';
        }

        callback.call(resultString);
    };

    // ERROR handler
    xhr.onerror = function() {
        console.log( '[-_-] XMLHttpRequest ERROR: ' + this.status );
    };

    // Send request
    xhr.send()
};

export {requestHandler}