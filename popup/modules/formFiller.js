let scanButton = $('#scanDOM');
let scanResultsArea = $('#scanResultsArea');
let scanOptions = $('#scanOptions');

// All scanned results will overwrite this variable
let scanResultsStorage = 'scanResultsStorage';
// Used to keep link on currently active template
let activeTemplateStorage = 'activeTemplateStorage';
// Used to keep templates
let templatesStorage = 'templatesStorage';

let addFormTemplateInput = $('#addFormTemplateInput');
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
        // Remove item from array
        itemContainer.splice(indexInTemplate, 1);
        chrome.storage.local.set({[templateName]: itemContainer});
        // Rebuild item list
        rebuildItemsList(itemContainer, templateName);
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
 * Build list of found elements on page
 * @param items
 * @param templateName - name of storage. Required to build correct references for 'item removal' functionality
 */
let buildItemsList = (items, templateName) => {
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
 * Wrapper for buildItemsList function
 * @param items
 * @param templateName - name of storage. Required to build correct references for 'item removal' functionality
 */
let rebuildItemsList = (items, templateName) => {
    $(scanResultsArea).empty();
    buildItemsList(items, templateName);
};

/**
 * Build template selector based on what was set
 */
let buildTemplateSelector = () => {
    chrome.storage.local.get(templatesStorage, function (result) {
        if (result.templatesStorage === undefined) {
            let emptyOption = document.createElement('option');
            emptyOption.text = 'Nothing to display';
            formTemplateSelector.append(emptyOption);
        } else {
            $.each(result.templatesStorage, function (index, value) {
                let option = document.createElement('option');
                option.text = index;
                $(formTemplateSelector).append(option);
            })
        }
    })
};

/**
 * Rebuild template selector based on what was set
 */
let rebuildTemplateSelector = () => {
    $(formTemplateSelector).empty();
    buildTemplateSelector();
};

/**
 * Add template to storage / update selector with new value
 * @param {String} templateName
 */
let addTemplate = (templateName) => {
    chrome.storage.local.get([templatesStorage], function (result) {
        // Check if templatesStorage is already defined
        if (result.templatesStorage) {
            // Update templatesStorage with new item
            result.templatesStorage[templateName] = itemContainer;
            chrome.storage.local.set({[templatesStorage]: result.templatesStorage});
            // Update selector with added value
            rebuildTemplateSelector();
        } else {
            // If templateContainer isn't defined yet - create it AND put new template inside
            let templateContainer = {};
            templateContainer[templateName] = itemContainer;
            chrome.storage.local.set({[templatesStorage]: templateContainer});
            rebuildTemplateSelector();
        }
    })
};

/**
 * Setup button click events for all buttons in module
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
    // Event handler for '+' add button
    $(addFormTemplateButton).click(function () {
        // RegExp to be used here!
        if ($(addFormTemplateInput)[0].value && $(addFormTemplateInput)[0].value !== "" && $(addFormTemplateInput)[0].value !== " ") {
            addTemplate($(addFormTemplateInput)[0].value);
        }
    });
    // Event handler for '-' remove button
    $(deleteFormTemplateButton).click(function () {
        let selectedValue = $(formTemplateSelector).val();
        if (selectedValue !== null || selectedValue !== undefined) {
            chrome.storage.local.get([templatesStorage], function (result) {
                // Delete selected template from storage
                delete result.templatesStorage[selectedValue];
                chrome.storage.local.set({[templatesStorage]: result.templatesStorage});
                // Update selector from storage
                rebuildTemplateSelector();
            });
        }
    });
};

/**
 * Setup module
 */
let setupFormFillerModule = function () {
    // Setup click events for all buttons in module
    setupButtonClickEvents();
    // Listen for messages from content scripts
    // Build items list based on response
    chrome.runtime.onMessage.addListener(function (message) {
        // Get current scanResultsStorage list
        chrome.storage.local.get([scanResultsStorage], function (result) {
            // Concatenate what is displayed and what was found
            itemContainer = result.scanResultsStorage.concat(message.resultDOM);
            chrome.storage.local.set({[scanResultsStorage]: itemContainer});
            rebuildItemsList(itemContainer, scanResultsStorage);
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
    });
    // Fill selector with templates names
    buildTemplateSelector();
};

export {setupFormFillerModule}