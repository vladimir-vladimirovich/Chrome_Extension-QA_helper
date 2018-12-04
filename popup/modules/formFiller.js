let scanButton = $('#scanDOM');
let scanResultsArea = $('#scanResultsArea');
let scanOptions = $('#scanOptions');

// All scanned results will overwrite this variable
let scanResultsStorage = 'scanResultsStorage';
// Used to keep link on currently active template
let activeTemplateStorage = 'activeTemplate';

let addFormTemplateButton = $('#addFormTemplateButton');
let deleteFormTemplateButton = $('#deleteFormTemplateButton');
let formTemplateSelector = $('#formTemplateSelector');

// Global variable. Is used to keep actual displayed list
let itemContainer = [];

/**
 * Setup remove event on '.btn' remove click
 * @param element
 * @param templateName
 * @param indexInTemplate
 */
let setupRemoveEvent = (element, templateName, indexInTemplate) => {
    // Setup remove event for '-' button
    $(element).find('.btn').click(function (e) {
        // Remove item from DOM
        $(e.currentTarget).closest('.item-container').remove();

        // // 1. Get template from storage
        // // 2. Remove current item from template
        // // 3. Save new template w/o removed item
        // chrome.storage.local.get(templateName, function (result) {
        //     if (result[templateName]) {
        //         // result[templateName].splice(indexInTemplate, 1);
        //         chrome.storage.local.set({[templateName]: result[templateName]});
        //     }
        // });

        itemContainer.splice(indexInTemplate, 1);
        chrome.storage.local.set({[templateName]: itemContainer});

        rebuildItemsList(itemContainer, templateName);

        console.log('*** indexInTemplate ***');
        console.log(indexInTemplate);

        console.log('*** itemContainer after splice ***');
        console.log(itemContainer);

    });
    // Add this element to scanResultsArea
    scanResultsArea.append(element);
};

/**
 * Add new field for <input> element found on page.
 * Not CHECKBOX
 */
let addEntryField = (name, value, templateName, indexInTemplate) => {
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

    setupRemoveEvent(entryField, templateName, indexInTemplate);
};

/**
 * Add new field for <select> element found on page
 */
let addSelectField = (name, value, templateName, indexInTemplate) => {
    let selectField = $('<div class="item-container form-group">' +
        `                   <label for="addDeviceInput">${name} [Selector]</label>` +
        '                   <div class="btn-group my-1 w-100">' +
        `                       <input type="text" class="form-control col-10" value='${value}'>` +
        '                       <button class="btn btn-outline-danger col-2">-</button>' +
        '                   </div>' +
        '                </div>')[0];

    setupRemoveEvent(selectField, templateName, indexInTemplate);
};

/**
 * Add new field for <input>.type = 'checkbox'
 */
let addCheckboxField = (name, value, templateName, indexInTemplate) => {
    let selectField = $('<div class="item-container form-group">' +
        `                   <label for="addDeviceInput">${name} [Checkbox]</label>` +
        '                   <div class="btn-group my-1 w-100">' +
        `                       <input type="text" class="form-control col-10" value='${value}'>` +
        '                       <button class="btn btn-outline-danger col-2">-</button>' +
        '                   </div>' +
        '                </div>')[0];

    setupRemoveEvent(selectField, templateName, indexInTemplate);
};

/**
 * Wrapper for buildItemsList function
 * @param items
 * @param templateName - name of storage. Required to build correct references for 'item removal' functionality
 */
let rebuildItemsList = (items, templateName) => {
    $(scanResultsArea).empty();
    buildItemsList(items, templateName);
};

/**
 * Build list of found elements on page
 * @param items
 * @param templateName - name of storage. Required to build correct references for 'item removal' functionality
 */
let buildItemsList = (items, templateName) => {
    console.log('=== items ===');
    console.log(items);
    for (let i = 0; i < items.length; i++) {
        // Check if selector, checkbox or entry field was found and create related DOM element
        if (items[i].tagName === 'SELECT') {
            addSelectField(items[i].name, items[i].value, templateName, i)
        } else if (items[i].type !== 'checkbox') {
            addEntryField(items[i].name, items[i].value, templateName, i);
        } else if (items[i].type === 'checkbox') {
            addCheckboxField(items[i].name, items[i].value, templateName, i);
        }
    }
};

/**
 * Setup button click events
 */
let setupButtonClickEvents = () => {
    // Event handler for click on 'Scan page' button
    // Sends request to contentScripts with chosen selector value
    $(scanButton).click(function () {
        let actionItem = scanOptions[0].value;
        // Clear item list if activeTemplateStorage doesn't point to scanResultsStorage
        chrome.storage.local.get([activeTemplateStorage], function (result) {
            if (result[activeTemplateStorage] !== scanResultsStorage) {
                $(scanResultsArea).empty();
                chrome.storage.local.set({[activeTemplateStorage]: scanResultsStorage});
            }
            // Send message to currently active tab to trigger check
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {scanDOM: actionItem});
            });
        });
    });
};

/**
 * Setup module
 */
let setupFormFiller = function () {
    setupButtonClickEvents();
    // Listen for messages from content scripts
    // Build items list based on response
    chrome.runtime.onMessage.addListener(function (message) {
        // Get current scanResultsStorage list
        chrome.storage.local.get([scanResultsStorage], function (result) {
            // Concatenate what is displayed and what was found
            itemContainer = result.scanResultsStorage.concat(message.resultDOM);
            chrome.storage.local.set({[scanResultsStorage]: itemContainer});
            buildItemsList(itemContainer, scanResultsStorage);
        });
    });
    // Build items list of scanned elements on pop up open
    chrome.storage.local.get([scanResultsStorage], function (result) {
        if (result.scanResultsStorage) {
            // Clear results area before adding new elements
            $(scanResultsArea).empty();
            itemContainer = result.scanResultsStorage;
            buildItemsList(itemContainer, scanResultsStorage);
        }
    })
};

export {setupFormFiller}