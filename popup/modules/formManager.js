import formManagerData from "../data/formManagerData.js";

export default class FormManager {
    constructor() {
        this.scanButton = document.querySelector(formManagerData.selectors.scanButton);
        this.scanOptions = document.querySelector(formManagerData.selectors.scanOptions);
        this.scanResultsArea = document.querySelector(formManagerData.selectors.scanResultsArea);
        this.formTemplateSelector = document.querySelector(formManagerData.selectors.formTemplateSelector);
        this.addFormTemplateInput = document.querySelector(formManagerData.selectors.addFormTemplateInput);
        this.addFormTemplateButton = document.querySelector(formManagerData.selectors.addFormTemplateButton);
        this.currentDOMForm = [];
        this.currentForm = [];
    };

    /**
     * Get template from storage
     * @param templateName
     */
    getForm(templateName) {
        chrome.storage.local.get(formManagerData.storage.formTemplates, (result) => {
            if (result[formManagerData.storage.formTemplates] && result[formManagerData.storage.formTemplates][templateName]) {
                return result[formManagerData.storage.formTemplates][templateName]
            } else return "#ERROR getForm. Probably form: " + templateName + " doesn't exist"
        })
    }

    /**
     * Set 'Not chosen' placeholder to form formTemplates selector
     */
    setDefaultPlaceholder() {
        let placeholderOption = $('<option></option>');
        $(placeholderOption)
            .attr('selected', true)
            .attr('disabled', true)
            .text('Not chosen');
        $(this.formTemplateSelector).prepend(placeholderOption);
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
     * Pull data from template storage
     * update drop down options with pulled values
     */
    setupTemplatesDropDown() {
        chrome.storage.local.get([formManagerData.storage.formTemplates], (result) => {
            if (result[formManagerData.storage.formTemplates]) {
                $(this.formTemplateSelector).empty();
                let options = Object.keys(result[formManagerData.storage.formTemplates]);
                options.forEach((item) => {
                    let option = document.createElement('option');
                    option.text = item;
                    $(this.formTemplateSelector).append(option);
                })
            }
        })
    };

    /**
     * Setup change event for form templates selector
     */
    setupTemplateChangeEvent() {
        $(this.formTemplateSelector).change((event) => {
            chrome.storage.local.set({[formManagerData.storage.activeFormTemplate]: event.target.value});

        })
    }

    /**
     * Add new template to storage
     * @param templateName {String}
     * @param templateData {Array}
     */
    saveTemplate(templateName, templateData) {
        chrome.storage.local.get([formManagerData.storage.formTemplates], (result) => {
            if (!result[formManagerData.storage.formTemplates]) {
                let newTemplate = {};
                newTemplate[templateName] = templateData;
                chrome.storage.local.set({[formManagerData.storage.formTemplates]: newTemplate});
            } else {
                result[formManagerData.storage.formTemplates][templateName] = templateData;
                chrome.storage.local.set({[formManagerData.storage.formTemplates]: result[formManagerData.storage.formTemplates]})
            }
        })
    };

    /**
     * Setup button click event
     */
    setupAddTemplateButtonClickEvent() {
        $(this.addFormTemplateButton).click(() => {
            if (!($(this.addFormTemplateInput)[0].value) || $(this.addFormTemplateInput)[0].value !== " ") {
                this.saveTemplate($(this.addFormTemplateInput)[0].value, this.currentForm);
            }
        })
    }

    /**
     * Listen to content scripts for array of scanned DOM elements
     */
    setupResultDOMListener() {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.resultDOM) {
                this.saveTemplate(formManagerData.storage.scanResults, message.resultDOM);
                this.updateCurrentDOMForm(message.resultDOM, formManagerData.storage.scanResults);
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
        let length = this.currentDOMForm.length;
        $(block).find('button').click(() => {
            // Remove from DOM
            $(block).remove();
            // Update storage variable
            chrome.storage.local.get(formManagerData.storage.formTemplates, (result) => {
                if (result[formManagerData.storage.formTemplates][templateName]) {
                    result[formManagerData.storage.formTemplates][templateName].splice(length, 1);
                    chrome.storage.local.set({[formManagerData.storage.formTemplates]: result[formManagerData.storage.formTemplates]});
                    this.updateCurrentDOMForm(result[formManagerData.storage.formTemplates][templateName], templateName);
                    this.buildForm();
                } else console.log("#ERROR IN setupRemoveBlockEvent");
            })
        });
    };

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
        this.currentDOMForm.push(inputBlock);
    };

    /**
     * Add common field to page
     * @param name
     * @param value
     * @param tagName
     * @param templateName
     */
    createBlock(name, value, tagName, templateName) {
        let block = $('<div class="item-container currentDOMForm-group mt-1 mb-1">' +
            `                   <label class="mb-0" for="addDeviceInput">${name} [${tagName}]</label>` +
            '                   <div class="btn-group w-100">' +
            `                       <input type="text" class="form-control col-10" value='${value}'>` +
            '                       <button class="btn btn-outline-danger col-2">-</button>' +
            '                   </div>' +
            '                </div>')[0];
        this.setupRemoveBlockEvent(block, templateName);
        this.currentDOMForm.push(block);
    };

    /**
     * @param form
     * @param templateName
     */
    setCurrentDOMForm(form, templateName) {
        form.forEach((item) => {
            item.tagName === "INPUT"
                ? this.createInputBlock(item.name, item.value, templateName)
                : this.createBlock(item.name, item.value, item.tagName, templateName);
        });
    };

    /**
     * Setter for this.currentForm
     * @param form
     */
    setCurrentForm(form) {
        this.currentForm = form;
    }

    /**
     * Draw currentDOMForm on the page
     * @param form {Array}
     * @param templateName {String}
     */
    updateCurrentDOMForm(form, templateName) {
        this.currentForm = [];
        this.currentDOMForm = [];
        $(this.scanResultsArea).empty();
        this.setCurrentDOMForm(form, templateName);
        this.setCurrentForm(form)
    };

    /**
     * Draw form from this.currentDOMForm
     */
    buildForm() {
        this.currentDOMForm.forEach((item) => {
            $(this.scanResultsArea).append(item)
        })
    }

//    TO DO LIST
//    scanResults template should be chosen after scan

//    1. Ability to add new formTemplates
//    2. Set default chosen template upon pop up open
//    3. Ability to remove formTemplates
//    4. Paste data from template
}