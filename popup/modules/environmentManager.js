import envManagerData from "../data/envManagerData.js";
import formManagerData from "../data/formManagerData.js";

export default class EnvironmentManager {
    constructor() {
        this.environmentRadioGroup = document.getElementsByName(envManagerData.selectors.environmentRadioGroup);
        this.environmentSelector = document.querySelector(envManagerData.selectors.environmentSelector);
        this.environmentInput = document.querySelector(envManagerData.selectors.environmentInput);
        this.environmentAddButton = document.querySelector(envManagerData.selectors.environmentAddButton);
        this.environmentExpandButton = document.querySelector(envManagerData.selectors.environmentExpandButton);
        this.environmentRemoveButton = document.querySelector(envManagerData.selectors.environmentRemoveButton);
        this.versionSelector = document.querySelector(envManagerData.selectors.versionSelector);
        this.versionInput = document.querySelector(envManagerData.selectors.versionInput);
        this.versionAddButton = document.querySelector(envManagerData.selectors.versionAddButton);
        this.versionExpandButton = document.querySelector(envManagerData.selectors.versionExpandButton);
        this.versionRemoveButton = document.querySelector(envManagerData.selectors.versionRemoveButton);
    };

    /**
     * Create "environments" storage variable if it doesn't exist
     */
    initializeEnvironmentsStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.environments, result => {
                if (!result[envManagerData.storage.environments]) {
                    result[envManagerData.storage.environments] = {};
                    result[envManagerData.storage.environments][envManagerData.storage.test] = [];
                    result[envManagerData.storage.environments][envManagerData.storage.stg] = [];
                    result[envManagerData.storage.environments][envManagerData.storage.prod] = [];
                    chrome.storage.local.set(
                        {[envManagerData.storage.environments]: result[envManagerData.storage.environments]},
                        () => {
                            resolve();
                        })
                } else resolve();
            })
        })
    };

    /**
     * Create "versions" storage variable if it doesn't exist
     */
    initializeVersionsStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.versions, result => {
                if (!result[envManagerData.storage.versions]) {
                    chrome.storage.local.set({[envManagerData.storage.versions]: []}, () => {
                        resolve();
                    });
                } else resolve();
            })
        })
    };

    /**
     * Choose active group
     */
    initializeSetDefaultActiveGroup() {
        // let activeGroup = await this.getActiveGroup();
        this.getActiveGroup()
            .then(result => {
                if (result) {
                    $(this.environmentRadioGroup).filter(function () {
                        return $(this).val() === result;
                    }).parent().addClass("active")
                }
            })
    };

    /**
     * Fill environments dropdown with values
     */
    initializeEnvironmentsSelector() {
        this.getActiveGroup()
            .then(activeGroup => {
                return this.getEnvironments(activeGroup);
            })
            .then(environmentsArray => {
                this.fillSelectorWithOptions(this.environmentSelector, environmentsArray);
                this.addNotChosenPlaceholder(this.environmentSelector);
                return this.getActive(envManagerData.storage.activeEnvironment);
            })
            .then(activeEnv => {
                this.chooseActiveOption(this.environmentSelector, activeEnv);
            })
    };

    /**
     * Fill versions dropdown with values
     */
    initializeVersionsSelector() {
        this.getVersions()
            .then(versions => {
                this.fillSelectorWithOptions(this.versionSelector, versions);
                this.addNotChosenPlaceholder(this.versionSelector);
                return this.getActive(envManagerData.storage.activeVersion)
            })
            .then(activeVersion => {
                this.chooseActiveOption(this.versionSelector, activeVersion)
            })
    };

    /**
     * Fill selector with options
     * @param element
     * @param array
     */
    fillSelectorWithOptions(element, array) {
        $(element).empty();
        if (array) {
            array.forEach(item => {
                let option = document.createElement('option');
                option.text = item;
                $(element).append(option);
            });
        }
    };

    /**
     * Choose active option or not chosen if active doesn't exist in the list
     * @param element
     * @param activeOption
     */
    chooseActiveOption(element, activeOption) {
        if (this.hasOptionValue(element, activeOption)) {
            this.setOptionValueTo(element, activeOption)
        } else this.setOptionValueTo(element, formManagerData.option.notChosen)
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
     * Set option value
     * @param element
     * @param optionValue
     */
    setOptionValueTo(element, optionValue) {
        $(element)[0].value = optionValue;
    }

    /**
     * Setup click event on addButton
     */
    setupAddLinkButtonClickEvent() {
        $(this.environmentAddButton).click(async () => {
            let activeGroup = await this.getActiveGroup();
            let inputValue = $(this.environmentInput).val();
            await this.addEnvironmentToStorage(activeGroup, inputValue);
            $(this.environmentExpandButton).click();
            this.initializeEnvironmentsSelector(this.environmentSelector);
        })
    };

    /**
     * Setup add event for versionAddButton
     */
    setupAddVersionClickEvent() {
        $(this.versionAddButton).click(async () => {
            let inputValue = $(this.versionInput).val();
            await this.addVersionToStorage(inputValue);
            $(this.versionExpandButton).click();
            this.initializeVersionsSelector();
        })
    };

    /**
     * Change event for radio buttons in environmentRadioGroup
     */
    setupChangeActiveGroupEvent() {
        $(this.environmentRadioGroup).change(event => {
            this.updateActiveGroup(event.target.value);
            this.initializeEnvironmentsSelector(this.environmentSelector);
        })
    };

    /**
     * Change event for projectProperties selector
     */
    setupEnvSelectorChangeEvent() {
        $(this.environmentSelector).change(async (event) => {
            await this.saveDataToStorage(envManagerData.storage.activeEnvironment, event.target.value);
            chrome.runtime.sendMessage({[envManagerData.messages.urlChange]: event.target.value});
            this.initializeEnvironmentsSelector();
        })
    };

    /**
     * Change event for version selector
     */
    setupVersionSelectorChangeEvent() {
        $(this.versionSelector).change(async event => {
            await this.saveDataToStorage(envManagerData.storage.activeVersion, event.target.value);
            chrome.runtime.sendMessage({[envManagerData.messages.versionPathChange]: event.target.value});
            this.initializeVersionsSelector();
        })
    };

    /**
     * Remove selected env
     */
    setupRemoveEnvironmentEvent() {
        $(this.environmentRemoveButton).click(() => {
            this.getActiveGroup()
                .then(activeGroup => {
                    if ($(this.environmentSelector).val() !== formManagerData.option.notChosen) {
                        let selectorValue = $(this.environmentSelector).val();
                        return this.removeEnvFromStorage(activeGroup, selectorValue);
                    }
                })
                .then(() => {
                    this.initializeEnvironmentsSelector();
                })
        })
    };

    /**
     * Remove selected version
     */
    setupRemoveVersionEvent() {
        $(this.versionRemoveButton).click(async () => {
            let selectorValue = $(this.versionSelector).val();
            if (selectorValue !== formManagerData.option.notChosen) {
                let versions = await this.getVersions();
                versions.splice(versions.indexOf(selectorValue), 1);
                await this.saveDataToStorage(envManagerData.storage.versions, versions);
                this.initializeVersionsSelector();
            }
        })
    };

    /**
     * Returns currently active projectProperties group
     */
    getActiveGroup() {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.activeGroup, result => {
                if (result[envManagerData.storage.activeGroup]) {
                    resolve(result[envManagerData.storage.activeGroup])
                } else resolve(null);
            })
        })
    };

    /**
     * Returns array of environments from group
     */
    getEnvironments(group) {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.environments, result => {
                if (result[envManagerData.storage.environments] && result[envManagerData.storage.environments][group]) {
                    resolve(result[envManagerData.storage.environments][group]);
                } else {
                    resolve(null);
                }
            })
        })
    };

    /**
     * Returns array of saved versions
     */
    getVersions() {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.versions, result => {
                resolve(result[envManagerData.storage.versions]);
            })
        })
    };

    /**
     * Returns active projectProperties
     */
    getActive(storage) {
        return new Promise(resolve => {
            chrome.storage.local.get(storage, result => {
                if (result[storage]) {
                    resolve(result[storage]);
                } else resolve(null);
            })
        })
    };

    /**
     * Save new active group to storage
     * @param newActiveGroup
     */
    updateActiveGroup(newActiveGroup) {
        chrome.storage.local.set({[envManagerData.storage.activeGroup]: newActiveGroup})
    };

    /**
     * Update environments storage
     * @param storage
     * @param data
     */
    addEnvironmentToStorage(storage, data) {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.environments, async (result) => {
                if (result[envManagerData.storage.environments]) {
                    result[envManagerData.storage.environments][storage].push(data);
                    await this.saveDataToStorage(envManagerData.storage.environments, result[envManagerData.storage.environments]);
                    resolve();
                }
            })
        })
    };

    /**
     * remove value from environments storage
     * @param storage
     * @param data
     */
    removeEnvFromStorage(storage, data) {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.environments, async result => {
                if (result[envManagerData.storage.environments] && result[envManagerData.storage.environments][storage]) {
                    result[envManagerData.storage.environments][storage].splice(
                        result[envManagerData.storage.environments][storage].indexOf(data), 1
                    );
                    await this.saveDataToStorage(
                        envManagerData.storage.environments,
                        result[envManagerData.storage.environments]
                    );
                    resolve();
                }
            })
        })
    };

    /**
     * Update versions storage
     * @param version
     */
    addVersionToStorage(version) {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.versions, async result => {
                if (result[envManagerData.storage.versions]) {
                    result[envManagerData.storage.versions].push(version);
                    await this.saveDataToStorage(envManagerData.storage.versions, result[envManagerData.storage.versions]);
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
     * Complete projectProperties manager module setup
     */
    setup() {
        this.initializeEnvironmentsStorage()
            .then(() => {
                return this.initializeVersionsStorage();
            })
            .then(() => {
                this.initializeSetDefaultActiveGroup();
                this.initializeEnvironmentsSelector();
                this.initializeVersionsSelector();

                this.setupChangeActiveGroupEvent();

                this.setupEnvSelectorChangeEvent();
                this.setupVersionSelectorChangeEvent();

                this.setupAddLinkButtonClickEvent();
                this.setupAddVersionClickEvent();

                this.setupRemoveEnvironmentEvent();
                this.setupRemoveVersionEvent();
            })
    }
}