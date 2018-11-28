// let scanButton = document.getElementById('scanDOM');
let scanButton = $('#scanDOM');
let scanResultsArea = $('#scanResultsArea');
let scanOptions = $('#scanOptions');

/**
 * Add new item to scan results area
 * @param item
 */
let addNewItem = (item) => {
    scanResultsArea.append(item);
};

// Setup
let setupFormFiller = function () {
    // Event handler for click on 'Scan page' button
    // Sends request to contentScripts with chosen selector value
    $(scanButton).click(function () {
        let actionItem = scanOptions[0].value;

        // Send message to currently active tab to trigger check
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {scanDOM: actionItem});
        });
    });

    chrome.runtime.onMessage.addListener(function (request) {
        if (request.resultDOM) {
            console.log("+++++++ request.resultDOM.resultArray +++++++");
            console.log(request);
            for (let i = 0; i < request.resultDOM.length; i++) {
                // Check if selector, checkbox or input field was found
                if (request.resultDOM[i].tagName === 'SELECT') {
                    console.log("Selector found");
                    console.log(request.resultDOM[i].name);
                } else if (request.resultDOM[i].type !== 'checkbox') {
                    console.log('Entry field found');
                    console.log(request.resultDOM[i].name);
                } else {
                    console.log('Checkbox field found');
                    console.log(request.resultDOM[i].name);
                }
            }
        }
    });
};

export {setupFormFiller}