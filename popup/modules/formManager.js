import formManagerData from "../data/formManagerData.js";

export default class FormManager {
    constructor() {
        this.scanButton = document.querySelector(formManagerData.selectors.scanButton);
        this.scanOptions = document.querySelector(formManagerData.selectors.scanOptions);
        this.scanResultsArea = document.querySelector(formManagerData.selectors.scanResultsArea);
        this.currentForm = [];
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
     * Listen to content scripts for array of scanned DOM elements
     */
    setupResultDOMListener() {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.resultDOM) {
                chrome.storage.local.set({[formManagerData.storage.scanResults]: message.resultDOM});
                this.updateCurrentForm(message.resultDOM, formManagerData.storage.scanResults);
                this.buildForm();
            }
        })
    };

    /**
     * Setup remove event for block in scanResultsArea
     * @param block {Element}
     * @param templateName {String}
     */
    setupRemoveBlockEvent(block, templateName) {
        let length = this.currentForm.length;
        $(block).find('button').click(() => {
            $(block).remove();
            chrome.storage.local.get(templateName, (result) => {
                if (result[templateName]) {
                    result[templateName].splice(length, 1);
                    chrome.storage.local.set({[templateName]: result[templateName]});
                    this.updateCurrentForm(result[templateName], templateName);
                    this.buildForm();
                }
            })
        });
    }

    /**
     * Add input field to page
     * @param name
     * @param value
     * @param templateName
     */
    createInputBlock(name, value, templateName) {
        let inputBlock = $('<div class="item-container mt-1 mb-1">' +
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

        this.setupRemoveBlockEvent(inputBlock, templateName);
        this.currentForm.push(inputBlock);
    };

    /**
     * Add common field to page
     * @param name
     * @param value
     * @param tagName
     * @param templateName
     */
    createBlock(name, value, tagName, templateName) {
        let block = $('<div class="item-container currentForm-group mt-1 mb-1">' +
            `                   <label class="mb-0" for="addDeviceInput">${name} [${tagName}]</label>` +
            '                   <div class="btn-group w-100">' +
            `                       <input type="text" class="form-control col-10" value='${value}'>` +
            '                       <button class="btn btn-outline-danger col-2">-</button>' +
            '                   </div>' +
            '                </div>')[0];

        this.setupRemoveBlockEvent(block, templateName);
        this.currentForm.push(block);
    };

    /**
     * @param form
     * @param templateName
     */
    setCurrentForm(form, templateName) {
        form.forEach((item) => {
            item.tagName === "INPUT"
                ? this.createInputBlock(item.name, item.value, templateName)
                : this.createBlock(item.name, item.value, item.tagName, templateName);
        });
    }

    /**
     * Draw currentForm on the page
     * @param form {Array}
     * @param templateName {String}
     */
    updateCurrentForm(form, templateName) {
        this.currentForm = [];
        $(this.scanResultsArea).empty();
        this.setCurrentForm(form, templateName);
    };

    /**
     * Draw form from this.currentForm
     */
    buildForm() {
        this.currentForm.forEach((item) => {
            $(this.scanResultsArea).append(item)
        })
    }

//    TO DO LIST
//    scanResults template should be chosen after scan

//    1. Ability to add new templates
//    2. Set default chosen template upon pop up open
//    3. Ability to remove templates
//    4. Paste data from template
}