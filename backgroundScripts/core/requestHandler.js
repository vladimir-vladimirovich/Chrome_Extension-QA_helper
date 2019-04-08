import EnvManagerHandler from "../popupHandlers/envManagerHandler.js";

/**
 * 1. Sends AJAX request
 * 2. Writes STRINGIFIED result in local storage
 * @param callback - ability to work with request result parsed by JSON.parse()
 */
export default {
    getVersionJSON(callback) {
        let activeURL = "";
        EnvManagerHandler.getActiveURL()
            .then(activeUrl => {
                activeURL = activeUrl;
                return EnvManagerHandler.getActiveVersion();
            })
            .then(activeVersion => {
                let xhr = new XMLHttpRequest();

                // Set connection options
                xhr.open('GET', activeURL + "/" + activeVersion, true);

                // Actions to be performed on load
                xhr.onload = () => {
                    if (activeURL === "" || activeVersion === "") {
                        callback("Bad XMLHttpResponse... :(");
                    } else {
                        let versionJSON = JSON.parse(xhr.responseText);

                        // Delete unnecessary property: commit log
                        delete versionJSON.WPL_Git_Log;
                        delete versionJSON.commits;

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
            });
    }
};
