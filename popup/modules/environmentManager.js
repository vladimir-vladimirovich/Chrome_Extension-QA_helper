import environmentManagerData from "../data/environmentManagerData.js";
import formManagerData from "../data/formManagerData.js";

export default class EnvironmentManager {
    constructor() {
        this.environmentRadioGroup = document.getElementsByName(environmentManagerData.selectors.environmentRadioGroup);
        this.environmentSelector = document.querySelector(environmentManagerData.selectors.environmentSelector);
        this.environmentInput = document.querySelector(environmentManagerData.selectors.environmentInput);
        this.environmentAddButton = document.querySelector(environmentManagerData.selectors.environmentAddButton);
        this.environmentExpandButton = document.querySelector(environmentManagerData.selectors.environmentExpandButton);
        this.environmentRemoveButton = document.querySelector(environmentManagerData.selectors.environmentRemoveButton);
        this.versionSelector = document.querySelector(environmentManagerData.selectors.versionSelector);
        this.versionInput = document.querySelector(environmentManagerData.selectors.versionInput);
        this.versionAddButton = document.querySelector(environmentManagerData.selectors.versionAddButton);
        this.versionExpandButton = document.querySelector(environmentManagerData.selectors.versionExpandButton);
        this.versionRemoveButton = document.querySelector(environmentManagerData.selectors.versionRemoveButton);
    };

    /**
     * Create "environments" storage variable if it doesn't exist
     */
    initializeStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(environmentManagerData.storage.environments, result => {
                if (!result[environmentManagerData.storage.environments]) {
                    result[environmentManagerData.storage.environments] = {};
                    result[environmentManagerData.storage.environments][environmentManagerData.storage.test] = [];
                    result[environmentManagerData.storage.environments][environmentManagerData.storage.stg] = [];
                    result[environmentManagerData.storage.environments][environmentManagerData.storage.prod] = [];
                    chrome.storage.local.set(
                        {[environmentManagerData.storage.environments]: result[environmentManagerData.storage.environments]},
                        () => {
                            resolve();
                        })
                }
            })
        })
    };

    /**
     * Choose active group
     */
    async initializeSetDefaultActiveGroup() {
        let activeGroup = await this.getActiveGroup();
        if (activeGroup) {
            $(this.environmentRadioGroup).filter(function () {
                return $(this).val() === activeGroup;
            }).parent().addClass("active")
        }
    };

    /**
     *
     */
    setupAddLinkButtonClickEvent(inputField, addButton, expandButton) {
        $(addButton).click(async () => {
            let activeGroup = await this.getActiveGroup();
            let inputValue = $(inputField).val();
            await this.addEnvironmentToStorage(activeGroup, inputValue);
            $(expandButton).click();
        })
    };

    /**
     *
     */
    setupChangeActiveGroupEvent() {
        $(this.environmentRadioGroup).change(event => {
            this.updateActiveGroup(event.target.value);
        })
    };


    /**
     * Returns currently active environment group
     */
    getActiveGroup() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(environmentManagerData.storage.activeGroup, result => {
                if (result[environmentManagerData.storage.activeGroup]) {
                    resolve(result[environmentManagerData.storage.activeGroup])
                } else reject(null);
            })
        })
    };

    /**
     * Save new active group to storage
     * @param newActiveGroup
     */
    updateActiveGroup(newActiveGroup) {
        chrome.storage.local.set({[environmentManagerData.storage.activeGroup]: newActiveGroup})
    };

    /**
     * Update environments storage
     * @param storage
     * @param data
     */
    addEnvironmentToStorage(storage, data) {
        return new Promise(resolve => {
            chrome.storage.local.get(environmentManagerData.storage.environments, async (result) => {
                console.log(result);
                if (result[environmentManagerData.storage.environments]) {
                    result[environmentManagerData.storage.environments][storage].push(data);
                    await this.saveDataToStorage(environmentManagerData.storage.environments, result[environmentManagerData.storage.environments]);
                    resolve();
                }
            })
        })
    };

    /**
     * Set 'Not chosen' placeholder to form formTemplates selector
     */
    addNotChosenPlaceholder(element) {
        let placeholderOption = $('<option></option>');
        $(placeholderOption)
            .attr('selected', true)
            .attr('disabled', true)
            .text(formManagerData.option.notChosen);
        $(element).prepend(placeholderOption);
    };

    /**
     * Save data to chrome storage
     * @param storage
     * @param data
     */
    saveDataToStorage(storage, data) {
        return new Promise(resolve => {
            chrome.storage.local.set({[storage]: data}, () => {
                resolve();
            });
        })
    };

    /**
     * Complete environment manager module setup
     */
    setup() {
        this.setupAddLinkButtonClickEvent(this.environmentInput, this.environmentAddButton, this.environmentExpandButton);
        this.setupAddLinkButtonClickEvent(this.versionInput, this.versionAddButton, this.versionExpandButton);

        this.addNotChosenPlaceholder(this.environmentSelector);
        this.addNotChosenPlaceholder(this.versionSelector);
    }
}