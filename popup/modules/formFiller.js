let scanButton = $('#scanDOM');
let scanResultsArea = $('#scanResultsArea');
let scanOptions = $('#scanOptions');

/**
 * Add new field to scanResultsArea
 */
let addEntryField = (name, value) => {
    let entryField = $('<div class="item-container">' +
        `                <label for="addDeviceInput">${name}</label>` +
        '                <div class="btn-group my-1">' +
        `                    <input type="text" class="form-control col-7" placeholder="test" value='${value}'>` +
        '                    <select class="custom-select col-3" aria-label="Example select with button addon">' +
        '                        <option value="Only empty">None</option>' +
        '                        <option value="Only filled">Username randomized</option>' +
        '                        <option value="Only input">Email randomized</option>' +
        '                    </select>' +
        '                    <button class="btn btn-outline-danger col-2">-</button>' +
        '                </div>' +
        '            </div>')[0];

    $(entryField).find('.btn').click(function (e) {
        $(e.currentTarget).closest('.item-container').remove();
    });
    scanResultsArea.append(entryField);
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

    // Listen for messages from content scripts. Waiting for array of objects with
    chrome.runtime.onMessage.addListener(function (request) {
        if (request.resultDOM) {
            for (let i = 0; i < request.resultDOM.length; i++) {
                // Check if selector, checkbox or entry field was found
                if (request.resultDOM[i].tagName === 'SELECT') {
                    // TDB
                } else if (request.resultDOM[i].type !== 'checkbox') {
                    addEntryField(request.resultDOM[i].name, request.resultDOM[i].value);
                } else {
                    // TBD
                }
            }
        }
    });
};

export {setupFormFiller}