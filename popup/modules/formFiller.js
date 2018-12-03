let scanButton = $('#scanDOM');
let scanResultsArea = $('#scanResultsArea');
let scanOptions = $('#scanOptions');

// All scanned results will overwrite this variable
let scanResultsStorage = 'scanResultsStorage';
// Used to keep link on currently active template
let activeTemplateStorage = 'activeTemplate';

/**
 * Setup remove event on '.btn' remove click
 * @param element
 */
let setupRemoveEvent = (element) => {
    $(element).find('.btn').click(function (e) {
        $(e.currentTarget).closest('.item-container').remove();
    });
    scanResultsArea.append(element);
};

/**
 * Add new field for <input> element found on page.
 * Not CHECKBOX
 */
let addEntryField = (name, value) => {
    let entryField = $('<div class="item-container">' +
        `                <label>${name} [Input]</label>` +
        '                <div class="btn-group my-1">' +
        `                    <input type="text" class="form-control col-7" value='${value}'>` +
        '                    <select class="custom-select col-3">' +
        '                        <option value="Only empty">None</option>' +
        '                        <option value="Only filled">Username randomized</option>' +
        '                        <option value="Only input">Email randomized</option>' +
        '                    </select>' +
        '                    <button class="btn btn-outline-danger col-2">-</button>' +
        '                </div>' +
        '            </div>')[0];

    setupRemoveEvent(entryField);
};

/**
 * Add new field for <select> element found on page
 */
let addSelectField = (name, value) => {
    let selectField = $('<div class="item-container form-group">' +
        `                   <label for="addDeviceInput">${name} [Selector]</label>` +
        '                   <div class="btn-group my-1 w-100">' +
        `                       <input type="text" class="form-control col-10" value='${value}'>` +
        '                       <button class="btn btn-outline-danger col-2">-</button>' +
        '                   </div>' +
        '                </div>')[0];

    setupRemoveEvent(selectField);
};

/**
 * Add new field for <input> .type = 'checkbox'
 */
let addCheckboxField = (name, value) => {
    let selectField = $('<div class="item-container form-group">' +
        `                   <label for="addDeviceInput">${name} [Checkbox]</label>` +
        '                   <div class="btn-group my-1 w-100">' +
        `                       <input type="text" class="form-control col-10" value='${value}'>` +
        '                       <button class="btn btn-outline-danger col-2">-</button>' +
        '                   </div>' +
        '                </div>')[0];

    setupRemoveEvent(selectField);
};

/**
 * Build list of found elements on page
 */
let buildItemsList = (items) => {
    for (let i = 0; i < items.length; i++) {
        // Check if selector, checkbox or entry field was found and create related DOM element
        if (items[i].tagName === 'SELECT') {
            addSelectField(items[i].name, items[i].value)
        } else if (items[i].type !== 'checkbox') {
            addEntryField(items[i].name, items[i].value);
        } else if (items[i].type === 'checkbox') {
            addCheckboxField(items[i].name, items[i].value);
        }
    }
};

/**
 * Setup module
 */
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

    // Listen for messages from content scripts
    // Build items list based on response
    chrome.runtime.onMessage.addListener(function (request) {
        chrome.storage.local.set({[scanResultsStorage]: request.resultDOM});
        buildItemsList(request.resultDOM)
    });

    // Build items list of scanned elements on pop up open
    chrome.storage.local.get([scanResultsStorage], function (result) {
        if (result.scanResultsStorage) {
            // Clear results area before adding new elements
            $(scanResultsArea).empty();
            buildItemsList(result.scanResultsStorage)
        }
    })
};

export {setupFormFiller}