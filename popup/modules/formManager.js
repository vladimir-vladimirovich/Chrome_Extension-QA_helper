import formManagerData from "../data/formManagerData.js";
import RandomizerUtils from "../utils/randomizerUtils.js";
import randomizerData from "../data/randomizerData.js";

export default class FormManager {
    constructor() {
        this.scanButton = document.querySelector(formManagerData.selectors.scanButton);
        this.scanOptions = document.querySelector(formManagerData.selectors.scanOptions);
        this.scanResultsArea = document.querySelector(formManagerData.selectors.scanResultsArea);
        this.formTemplateSelector = document.querySelector(formManagerData.selectors.formTemplateSelector);
        this.addFormTemplateInput = document.querySelector(formManagerData.selectors.addFormTemplateInput);
        this.addFormTemplateButton = document.querySelector(formManagerData.selectors.addFormTemplateButton);
        this.removeFormTemplateButton = document.querySelector(formManagerData.selectors.removeFormTemplateButton);
        this.expandFormTemplateButton = document.querySelector(formManagerData.selectors.expandFormTemplateButton);
        this.pasteFormButton = document.querySelector(formManagerData.selectors.pasteFormButton);
        this.currentFormDOM = [];
        this.currentFormData = [];
    };

    /**
     * Initialize "formTemplates" storage if it doesn't exist yet
     */
    initializeStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(formManagerData.storage.formTemplates, async (result) => {
                if (!result[formManagerData.storage.formTemplates]) {
                    await this.saveDataToChromeStorage(formManagerData.storage.formTemplates, {});
                    resolve();
                }
                resolve();
            })
        })
    };

    /**
     * Pull form list form storage and fill the drop down
     */
    initializeTemplatesDropDown() {
        chrome.storage.local.get(formManagerData.storage.formTemplates, async (result) => {
            if (result[formManagerData.storage.formTemplates]) {
                $(this.formTemplateSelector).empty();
                let options = Object.keys(result[formManagerData.storage.formTemplates]);
                options.forEach((item) => {
                    let option = document.createElement('option');
                    option.text = item;
                    $(this.formTemplateSelector).append(option);
                });
                this.addNotChosenPlaceholder();
                this.chooseActiveFrom();
                let formName = await this.getActiveForm();
                let formData = await this.getForm(formName);
                this.initializeForm(formName, formData);
            } else console.log("#ERROR IN initializeTemplatesDropDown");
        });
    };

    /**
     * Set active form as chosen by default
     */
    chooseActiveFrom() {
        chrome.storage.local.get(formManagerData.storage.activeFormTemplate, (result) => {
            if (result[formManagerData.storage.activeFormTemplate]) {
                if (this.hasOptionValue(this.formTemplateSelector, result[formManagerData.storage.activeFormTemplate])) {
                    $(this.formTemplateSelector)[0].value = result[formManagerData.storage.activeFormTemplate];
                } else $(this.formTemplateSelector)[0].value = formManagerData.option.notChosen;
            }
        })
    };

    /**
     * Check if element has an option with required value
     * @param element
     * @param value
     */
    hasOptionValue(element, value) {
        let result = $(element).find('option').filter(function () {
            if (this.value === value) {
                return this;
            } else return null
        });

        if (result[0] && result[0].value) {
            return result[0].value
        } else return null
    };

    /**
     * Get form array
     * @param templateName
     */
    getForm(templateName) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(formManagerData.storage.formTemplates, (result) => {
                if (result[formManagerData.storage.formTemplates][templateName]) {
                    resolve(result[formManagerData.storage.formTemplates][templateName]);
                } else {
                    console.log("#ERROR(minor?) IN getForm: following form wasn't found: [" + templateName + "]");
                    reject(null);
                }
            })
        })
    }

    /**
     * Getter for active form
     */
    getActiveForm() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(formManagerData.storage.activeFormTemplate, (result) => {
                if (result[formManagerData.storage.activeFormTemplate]) {
                    resolve(result[formManagerData.storage.activeFormTemplate]);
                } else {
                    console.log("#ERROR IN getActiveForm");
                    reject(null);
                }
            })
        })
    };

    /**
     * Getter for currently selected option in form templates
     */
    getActiveFormOption() {
        return $(this.formTemplateSelector)[0].value;
    };

    /**
     * Set 'Not chosen' placeholder to form formTemplates selector
     */
    addNotChosenPlaceholder() {
        let placeholderOption = $('<option></option>');
        $(placeholderOption)
            .attr('selected', true)
            .attr('disabled', true)
            .text(formManagerData.option.notChosen);
        $(this.formTemplateSelector).prepend(placeholderOption);
    };

    /**
     * Update chrome template in storage with some template
     * @param templateName {String}
     * @param template
     */
    updateStorageTemplate(templateName, template) {
        return new Promise(resolve => {
            chrome.storage.local.get([formManagerData.storage.formTemplates], async (result) => {
                if (result[formManagerData.storage.formTemplates]) {
                    result[formManagerData.storage.formTemplates][templateName] = template;
                    await this.saveDataToChromeStorage(formManagerData.storage.formTemplates, result[formManagerData.storage.formTemplates]);
                    resolve();
                } else console.error("#ERROR IN updateStorageTemplate")
            })
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
        return new Promise(resolve => {
            chrome.storage.local.set({[storageName]: data}, () => {
                resolve();
            });
        });
    };

    /**
     * Remove template from formManagerData.storage.formTemplates
     * @param templateName {String}
     */
    removeTemplateFromStorage(templateName) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(formManagerData.storage.formTemplates, async (result) => {
                if (result[formManagerData.storage.formTemplates][templateName]) {
                    delete result[formManagerData.storage.formTemplates][templateName];
                    await this.saveDataToChromeStorage(formManagerData.storage.formTemplates, result[formManagerData.storage.formTemplates]);
                    resolve();
                } else {
                    console.error("#ERROR IN removeTemplateFromStorage: can't get template [" + templateName + "]");
                    reject(null);
                }
            })
        })
    };

    /**
     * Setter for this.currentFormDOM
     * this.currentFormData should not be empty!!!
     */
    setFormDOM() {
        this.currentFormDOM = [];
        if (this.currentFormData.length > 0) {
            this.currentFormData.forEach((item) => {
                item.tagName === "INPUT"
                    ? this.currentFormDOM.push(this.createInputBlock(item.name, item.value))
                    : this.currentFormDOM.push(this.createBlock(item.name, item.value, item.tagName))
            });
        }
    };

    /**
     * Setup change event for drop down responsible for switching between active form templates
     */
    setupFormChangeEvent() {
        $(this.formTemplateSelector).change(async (event) => {
            await this.saveDataToChromeStorage(formManagerData.storage.activeFormTemplate, event.target.value);
            chrome.storage.local.get(formManagerData.storage.formTemplates, (result) => {
                if (result[formManagerData.storage.formTemplates][event.target.value]) {
                    this.initializeForm(event.target.value, result[formManagerData.storage.formTemplates][event.target.value]);
                } else console.error("#ERROR IN setupFormChangeEvent: storage not found [" + event.target.value + "]")
            });
        })
    };

    /**
     * Listen to content scripts for array of scanned DOM elements
     */
    setupResultDOMListener() {
        chrome.runtime.onMessage.addListener(async (message) => {
            if (message.resultDOM) {
                await this.updateStorageTemplate(formManagerData.storage.scanResults, message.resultDOM);
                await this.saveDataToChromeStorage(formManagerData.storage.activeFormTemplate, formManagerData.storage.scanResults);
                this.initializeTemplatesDropDown();
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
            $(item).find('button')[0].addEventListener("click", () => {
                $(item).remove();
            })
        })
    };

    /**
     * Remove from storage as well
     * @param templateName
     */
    setupRemoveFromStorageEvents(templateName) {
        for (let i = 0; i < this.currentFormDOM.length; i++) {
            $(this.currentFormDOM[i]).find("button").on("click", async () => {
                this.currentFormData.splice(i, 1);
                await this.updateStorageTemplate(templateName, this.currentFormData);
                this.initializeForm(templateName, this.currentFormData);
            })
        }
    };

    /**
     * Setup click event for this.addFormTemplateButton
     */
    setupAddFormButtonClickEvent() {
        $(this.addFormTemplateButton).click(async () => {
            if ($(this.addFormTemplateInput)[0].value) {
                if (this.currentFormData.length > 0 && this.currentFormDOM.length > 0) {
                    await this.updateStorageTemplate($(this.addFormTemplateInput)[0].value, this.currentFormData);
                    this.initializeTemplatesDropDown();
                    this.expandFormTemplateButton.click();
                } else console.error("#ERROR IN setupAddFormButtonClickEvent: 'current' values aren't empty")
            } else console.error("#ERROR IN setupAddFormButtonClickEvent: incorrect input")
        })
    };

    /**
     * Setup remove template button click event
     */
    setupRemoveTemplateEvent() {
        $(this.removeFormTemplateButton).click(async () => {
            let activeFormOption = this.getActiveFormOption();
            await this.removeTemplateFromStorage(activeFormOption);
            chrome.storage.local.remove(formManagerData.storage.activeFormTemplate);
            $(this.scanResultsArea).empty();
            this.initializeTemplatesDropDown();
        })
    };

    /**
     * Setup event for pasteFormButton
     */
    setupPasteFormClickEvent() {
        $(this.pasteFormButton).click(() => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {setActiveTemplate: this.currentFormData});
            });
        })
    };

    /**
     * Setup focusout event for input fields in scanResultsArea
     */
    setupFocusoutEvent(templateName) {
        for (let i = 0; i < this.currentFormDOM.length; i++) {
            $(this.currentFormDOM[i]).find("input").on("focusout", async (event) => {
                if (event.target.value !== this.currentFormData[i].value) {
                    let form = await this.getForm(templateName);
                    form[i].value = event.target.value;
                    this.updateStorageTemplate(templateName, form)
                }
            })
        }
    };

    /**
     * Setup 'change' event for selectors in form in scanResultsArea
     * @param templateName
     */
    setupTemplateSelectorChangeEvent(templateName) {
        for (let i = 0; i < this.currentFormDOM.length; i++) {
            $(this.currentFormDOM[i]).find("select").on("change", async (event) => {
                let form = await this.getForm(templateName);
                form[i].state = event.target.value;
                switch (form[i].state) {
                    case formManagerData.option.internalEmail:
                        form[i].value = RandomizerUtils.getRandomInternalEmail();
                        break;
                    case formManagerData.option.realEmail:
                        form[i].value = RandomizerUtils.getRandomRealEmail();
                        break;
                    case formManagerData.option.username:
                        form[i].value = RandomizerUtils.getRandomString(randomizerData.alphabet, 10);
                        break;
                }
                await this.updateStorageTemplate(templateName, form);
                this.initializeForm(templateName, form);
            })
        }
    };

    /**
     * Setup values for selectors in scanResultsArea
     * @param templateName
     * @param form
     */
    setupTemplateSelectorsValues(templateName, form) {
        for (let i = 0; i < this.currentFormDOM.length; i++) {
            $(this.currentFormDOM[i]).find("select")[0].value = form[i].state;
        }
    };

    /**
     * Save active storage template with new random values before page unload
     */
    saveNewRandomValuesBeforeUnload() {
        window.addEventListener("beforeunload", async (event) => {
            event.preventDefault();
            let activeTemplate = await this.getActiveForm();
            let form = await this.getForm(activeTemplate);

            if (form) {
                form.forEach((item) => {
                    switch (item.state) {
                        case formManagerData.option.internalEmail:
                            item.value = RandomizerUtils.getRandomInternalEmail();
                            break;
                        case formManagerData.option.realEmail:
                            item.value = RandomizerUtils.getRandomRealEmail();
                            break;
                        case formManagerData.option.username:
                            item.value = RandomizerUtils.getRandomString(randomizerData.alphabet, 10);
                            break;
                    }
                });
            }
            this.updateStorageTemplate(activeTemplate, form);
        })
    };

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
            '                        <option value="None">None</option>' +
            '                        <option value="Username">Username(random)</option>' +
            '                        <option value="Real email">Real email(random)</option>' +
            '                        <option value="Internal email">Internal email(random)</option>' +
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
        return $('<div class="item-container mt-1 mb-1">' +
            `                   <label class="mb-0" for="addDeviceInput">${name} [${tagName}]</label>` +
            '                   <div class="btn-group w-100">' +
            `                       <input type="text" class="form-control col-10" value='${value}'>` +
            '                       <button class="btn btn-outline-danger col-2">-</button>' +
            '                   </div>' +
            '                </div>')[0];
    };

    /**
     * All steps combined in one method
     */
    initializeForm(templateName, form) {
        if (templateName !== null) {
            this.changeDisableStatus(this.scanResultsArea, true);
            this.setFormData(form);
            this.setFormDOM();
            this.setupRemoveFromStorageEvents(templateName);
            this.setupRemoveFromDOMEvents();
            this.rebuildDOM();
            this.changeDisableStatus(this.scanResultsArea, false);
            this.setupFocusoutEvent(templateName);
            this.setupTemplateSelectorChangeEvent(templateName);
            this.setupTemplateSelectorsValues(templateName, form);
        }
    };

    /**
     * Clear DOM and then build
     */
    rebuildDOM() {
        $(this.scanResultsArea).empty();
        this.buildDOM();
    };

    /**
     * Append all elements from this.currentFormDOM to this.scanResultsArea
     */
    buildDOM() {
        if (this.currentFormDOM.length > 0) {
            this.currentFormDOM.forEach((item) => {
                $(this.scanResultsArea).append(item);
            })
        } else console.error("#ERROR in buildDOM: this.currentFormDOM is empty");
    };

    /**
     * Add "disabled" = false attribute to all scanResultsArea elements
     * @param element {Element}
     * @param status {Boolean}
     */
    changeDisableStatus(element, status) {
        $(element).find('button').prop("disabled", status);
        $(element).find('input').prop("disabled", status);
        $(element).find('select').prop("disabled", status);
    };

    /**
     * Complete module setup
     */
    setupFormManagerModule() {
        // Create main storage variable
        this.initializeStorage()
            .then(() => {
                // Setup drop down values and build form
                this.initializeTemplatesDropDown();
                // Listener for storage from content scripts
                this.setupResultDOMListener();
                // Setup .click() and .change()
                this.setupScanButtonClickEvent();
                this.setupAddFormButtonClickEvent();
                this.setupFormChangeEvent();
                this.setupRemoveTemplateEvent();
                this.setupPasteFormClickEvent();
                this.saveNewRandomValuesBeforeUnload();
            })
    }
}
