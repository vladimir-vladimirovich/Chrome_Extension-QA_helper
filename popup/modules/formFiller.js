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

// Is used to keep actual displayed list
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
        chrome.storage.local.get(templatesStorage, function (result) {
            result.templatesStorage[templateName] = itemContainer;
            chrome.storage.local.set({[templatesStorage]: result.templatesStorage});
        });
        // Rebuild item list
        rebuildItemsList(templateName, itemContainer);
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
let buildItemsList = (templateName, items) => {
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
let rebuildItemsList = (templateName, items) => {
    // Clean existing DOM
    $(scanResultsArea).empty();

    if (items === undefined) {
        // Pull items from storage automatically if 'items' aren't defined
        chrome.storage.local.get([templatesStorage], function (result) {
            items = result.templatesStorage[templateName];
            buildItemsList(templateName, items);
        });
    } else buildItemsList(templateName, items);
};

/**
 * Show placeholder in select tag
 */
let showPlaceHolderOption = () => {
    let placeholderOption = $('<option></option>');
    $(placeholderOption)
        .attr('selected', true)
        .attr('disabled', true)
        .text('Not chosen');
    formTemplateSelector.prepend(placeholderOption);
};

/**
 * Build template selector based on what was set
 */
let buildTemplateSelector = () => {
    chrome.storage.local.get(templatesStorage, function (resultTemplates) {
        if (resultTemplates.templatesStorage === undefined) {
            showPlaceHolderOption();
        } else {
            $.each(resultTemplates.templatesStorage, function (index, value) {
                let option = document.createElement('option');
                option.text = index;
                $(formTemplateSelector).append(option);
            })
        }
        // Choose option in selector
        chrome.storage.local.get(activeTemplateStorage, function (resultActive) {
            // if chosen template exists - choose it
            if (resultTemplates.templatesStorage[resultActive.activeTemplateStorage]) {
                $(formTemplateSelector).val(resultActive.activeTemplateStorage);
            } else {
                // If selected template was removed before the new one was chosen
                // add option with text 'Not chosen'
                showPlaceHolderOption();
            }
        });
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
        // Get currently selected value from dropdown
        let selectedValue = $(formTemplateSelector).val();
        if (selectedValue !== null || selectedValue !== undefined) {
            chrome.storage.local.get([templatesStorage], function (result) {
                // Delete selected template from storage
                delete result.templatesStorage[selectedValue];
                chrome.storage.local.set({[templatesStorage]: result.templatesStorage});
                // Update selector from storage
                rebuildTemplateSelector();
                // Clear the list in order to not to confuse users
                $(scanResultsArea).empty();
            });
        }
    });
};

/**
 * Setup events for module selectors
 */
let setupSelectorChangeEvent = () => {
    $(formTemplateSelector).change(function (eventObject) {
        console.log('CHANGED eventObject.target.value: ' + eventObject.target.value);
        // Update storage cell responsible for keeping currently selected template
        chrome.storage.local.set({[activeTemplateStorage]: eventObject.target.value});
        rebuildItemsList(eventObject.target.value)
    });
};

/**
 * Setup module
 */
let setupFormFillerModule = function () {
    // Setup click events for all buttons in module
    setupButtonClickEvents();
    // Setup change event for templates selector
    setupSelectorChangeEvent();
    // Listen for messages from content scripts
    // Build items list based on response
    chrome.runtime.onMessage.addListener(function (message) {
        if (message.resultDOM) {
            console.log('resultDOM');
            console.log(message.resultDOM);
            // Get current scanResultsStorage list
            chrome.storage.local.get(templatesStorage, function (result) {
                if (result.templatesStorage[scanResultsStorage]) {
                    // IF scanResultsStorage ALREADY EXISTS - update it
                    // Update module variable responsible for displayed list
                    itemContainer = result.templatesStorage[scanResultsStorage].concat(message.resultDOM);
                    result.templatesStorage[scanResultsStorage] = itemContainer;
                    // Save updated value to storage
                    chrome.storage.local.set({[templatesStorage]: result.templatesStorage});
                    // Update UI
                    rebuildItemsList(scanResultsStorage, itemContainer);
                    rebuildTemplateSelector();
                } else {
                    //IF NOT EXISTS YET - create new value in templatesStorage
                    result.templatesStorage[scanResultsStorage] = message.resultDOM;
                    // Update module variable responsible for displayed list
                    itemContainer = result.templatesStorage[scanResultsStorage];
                    // Save updated value to storage
                    chrome.storage.local.set({[templatesStorage]: result.templatesStorage});
                    // Update UI
                    rebuildItemsList(scanResultsStorage, itemContainer);
                    rebuildTemplateSelector();
                }
            });
        }
    });
    // Build items list of scanned elements on pop up open
    // Choose correct value in selector
    chrome.storage.local.get([activeTemplateStorage], function (resultActive) {
        if (resultActive.activeTemplateStorage) {
            // Fill selector with templates names
            buildTemplateSelector();
            // Clear results area before adding new elements
            $(scanResultsArea).empty();
            chrome.storage.local.get([templatesStorage], function (resultTemplates) {
                // ERROR here
                // sometimes resultActive.activeTemplateStorage = 'scanResultsStorage'
                // AND resultTemplates.templatesStorage[resultActive.activeTemplateStorage] - doesn't exists
                // expected
                itemContainer = resultTemplates.templatesStorage[resultActive.activeTemplateStorage];
                buildItemsList(scanResultsStorage, itemContainer);
            });
        }
    });
};

export {setupFormFillerModule}