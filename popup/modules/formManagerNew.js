import formManagerData from "../data/formManagerData.js";

export default class FormManagerNew {
    constructor() {
        this.scanButton = document.querySelector(formManagerData.selectors.scanButton);
        this.scanOptions = document.querySelector(formManagerData.selectors.scanOptions);
        this.scanResultsArea = document.querySelector(formManagerData.selectors.scanResultsArea);
        this.formTemplateSelector = document.querySelector(formManagerData.selectors.formTemplateSelector);
        this.addFormTemplateInput = document.querySelector(formManagerData.selectors.addFormTemplateInput);
        this.addFormTemplateButton = document.querySelector(formManagerData.selectors.addFormTemplateButton);
        this.currentFormDOM = [];
        this.currentFormData = [];
    };

    /**
     * Initialize "formTemplates" storage if it doesn't exist yet
     */
    initializeStorage() {
        chrome.storage.local.get(formManagerData.storage.formTemplates, (result) => {
            if (!result[formManagerData.storage.formTemplates]) {
                this.saveDataToChromeStorage(formManagerData.storage.formTemplates, {});
            }
        })
    };

    /**
     * Update chrome template in storage with some data
     * @param templateName {String}
     * @param data
     */
    addTemplateToStorage(templateName, data) {
        chrome.storage.local.get([formManagerData.storage.formTemplates], (result) => {
            if (result[formManagerData.storage.formTemplates]) {
                result[formManagerData.storage.formTemplates][templateName] = data;
                this.saveDataToChromeStorage(formManagerData.storage.formTemplates, result[formManagerData.storage.formTemplates]);
            } else console.log("#ERROR IN addTemplateToStorage")
        })
    };

    /**
     * Setter for this.currentFormData
     * @param form {Array}
     */
    setFormData(form) {
        this.currentFormData = form;
    };

    saveDataToChromeStorage(storageName, data) {
        chrome.storage.local.set({[storageName]: data});
    }

    /**
     * Setter for this.currentFormDOM
     * this.currentFormData should not be empty!!!
     */
    setFormDOM() {
        if (this.currentFormData.length > 0) {
            this.currentFormData.forEach((item) => {
                item.tagName === "INPUT"
                    ? this.currentFormDOM.push(this.createInputBlock(item.name, item.value))
                    : this.currentFormDOM.push(this.createBlock(item.name, item.value))
            });
        }
    };

    /**
     * Listen to content scripts for array of scanned DOM elements
     */
    setupResultDOMListener() {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.resultDOM) {
                this.addTemplateToStorage(formManagerData.storage.scanResults, message.resultDOM);
                this.setFormData(message.resultDOM);
                this.setFormDOM();
                this.setupRemoveFromDOMEvents();
                this.setupRemoveFromStorageEvents(formManagerData.storage.scanResults);
                this.buildDOM();
            }
        })
    };

    /**
     * Send request to scan DOM to content scripts
     */
    setupScanButtonClickEvent() {
        $(this.scanButton).click(() => {
            let scanOption = this.scanOptions.options[this.scanOptions.options.selectedIndex].value;
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {scanDOM: scanOption});
            });
        })
    };

    /**
     * Setup remove event upon click on "-" button for this.currentDOM
     * Removes from DOM and storage
     */
    setupRemoveFromDOMEvents() {
        this.currentFormDOM.forEach((item) => {
            $(item).find('button').click(() => {
                $(item).remove();
            })
        })
    };

    /**
     * Events to remove field from template saved in storage as well
     * this.currentFormDOM and this.currentFormData MUST NOT BE EMPTY!!!
     * @param formName {String}
     */
    setupRemoveFromStorageEvents(formName) {
        chrome.storage.local.get(formManagerData.storage.formTemplates, (result) => {
            if (result[formManagerData.storage.formTemplates][formName]) {
                if (this.currentFormData.length > 0 && this.currentFormDOM.length > 0) {
                    for (let i = 0; i < this.currentFormDOM.length; i++) {
                        $(this.currentFormDOM[i]).find('button').click(() => {
                            this.currentFormData.splice(i, 1);
                            this.currentFormDOM.splice(i, 1);
                            chrome.storage.local.get(formManagerData.storage.formTemplates, (result) => {
                                result[formManagerData.storage.formTemplates][formName].splice(i, 1);
                                this.saveDataToChromeStorage(formManagerData.storage.formTemplates, result[formManagerData.storage.formTemplates]);
                                this.rebuildDOM();
                            })
                        })
                    }
                } else console.log("#ERROR IN setupRemoveFromStorageEvents: current* is empty")
            } else console.log("#ERROR IN setupRemoveFromStorageEvents: result[formManagerData.storage.formTemplates][formName] doesn't exist")
        })
    }

    /**
     * Add input field to page
     * @param name
     * @param value
     */
    createInputBlock(name, value) {
        return $('<div class="item-container mt-1 mb-1">' +
            `                <label class="mb-0">${name} [Input]</label>` +
            '                <div class="btn-group">' +
            `                    <input type="text" class="form-control col-7" value='${value}'>` +
            '                    <select class="custom-select col-3">' +
            '                        <option value="Only empty">None</option>' +
            '                        <option value="Only filled">Username randomized</option>' +
            '                        <option value="Only input">Email randomized</option>' +
            '                    </select>' +
            '                    <button class="btn btn-outline-danger col-2">-</button>' +
            '                </div>' +
            '            </div>')[0];
    };

    /**
     * Add common field to page
     * @param name
     * @param value
     * @param tagName
     */
    createBlock(name, value, tagName) {
        return $('<div class="item-container currentDOMForm-group mt-1 mb-1">' +
            `                   <label class="mb-0" for="addDeviceInput">${name} [${tagName}]</label>` +
            '                   <div class="btn-group w-100">' +
            `                       <input type="text" class="form-control col-10" value='${value}'>` +
            '                       <button class="btn btn-outline-danger col-2">-</button>' +
            '                   </div>' +
            '                </div>')[0];
    };

    /**
     * Clear DOM and then build
     */
    rebuildDOM() {
        $(this.scanResultsArea).empty();
        this.buildDOM();
    }

    /**
     * Append all elements from this.currentFormDOM to this.scanResultsArea
     */
    buildDOM() {
        if (this.currentFormDOM.length > 0) {
            this.currentFormDOM.forEach((item) => {
                $(this.scanResultsArea).append(item);
            })
        } else console.log("#ERROR in buildDOM: this.currentFormDOM is empty")
    }
}