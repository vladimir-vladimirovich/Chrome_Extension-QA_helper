import environmentManagerData from "../data/environmentManagerData.js";

export default class EnvironmentManager {
    constructor() {
        this.environmentRadioGroup = document.getElementsByName(environmentManagerData.selectors.environmentRadioGroup);
    };

    /**
     * Create "environments" storage variable if it doesn't exist
     */
    initializeStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(environmentManagerData.storage.environments, result => {
                if (!result[environmentManagerData.storage.environments]) {
                    chrome.storage.local.set({[environmentManagerData.storage.environments]: {}}, () => {
                        resolve();
                    })
                }
            })
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
}