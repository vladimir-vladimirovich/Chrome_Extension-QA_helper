import {environment} from "../config/projectProperties.js";

/**
 * 1. Sends AJAX request
 * 2. Writes STRINGIFIED result in local storage
 * @param callback - ability to work with request result parsed by JSON.parse()
 */
export default {
    getVersionJSON(callback) {
        let xhr = new XMLHttpRequest();

        console.log('888 environment.defaultEnvironmentURL + environment.defaultFEJSONPass');
        console.log(environment.defaultEnvironmentURL + environment.defaultFEJSONPass + " ololo");

        // Set connection options
        xhr.open('GET', environment.defaultEnvironmentURL + environment.defaultFEJSONPass, true);

        // Actions to be performed on load
        xhr.onload = () => {
            if (environment.defaultEnvironmentURL === "" && environment.defaultFEJSONPass === "") {
                callback("Bad XMLHttpResponse... :(");
            } else {
                let versionJSON = JSON.parse(xhr.responseText);

                // Delete unnecessary property: commit log
                delete versionJSON.WPL_Git_Log;

                // Stringify parsed json
                let resultString = '';
                for (let prop in versionJSON) {
                    resultString = resultString + prop + ": " + versionJSON[prop] + '\n';
                }

                callback(resultString);
            }
        };

        // ERROR handler
        xhr.onerror = function () {
            console.log('[-_-] XMLHttpRequest ERROR: ' + this.status);
            callback("Bad XMLHttpResponse... :(");
        };

        // Send request
        xhr.send()
    }
};
