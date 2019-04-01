import envManagerData from "../data/envManagerData.js";
import {contextMenus} from "../contextMenus.js";

export default class EnvManagerHandler {
    /**
     * Create activeEnv storage if it doesn't exist
     */
    static initializeActiveEnvStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.activeEnvironment, result => {
                if (!result[envManagerData.storage.activeEnvironment]) {
                    chrome.storage.local.set({[envManagerData.storage.activeEnvironment]: ""}, () => {
                        resolve();
                    })
                } else resolve();
            })
        })
    };

    /**
     * Create activeVersion storage if it doesn't exist
     */
    static initializeActiveVersionStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.activeVersion, result => {
                if (!result[envManagerData.storage.activeVersion]) {
                    chrome.storage.local.set({[envManagerData.storage.activeVersion]: ""}, () => {
                        resolve();
                    })
                } else resolve();
            })
        })
    };

    /**
     * Return active URL or empty string
     */
    static getActiveURL() {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.activeEnvironment, result => {
                if (result[envManagerData.storage.activeEnvironment]) {
                    resolve(result[envManagerData.storage.activeEnvironment]);
                } else resolve("");
            })
        });
    };

    /**
     * Return active version or empty string
     */
    static getActiveVersion() {
        return new Promise(resolve => {
            chrome.storage.local.get(envManagerData.storage.activeVersion, result => {
                if (result[envManagerData.storage.activeVersion]) {
                    resolve(result[envManagerData.storage.activeVersion]);
                } else resolve("");
            })
        });
    };

    /**
     * Listener for 'drop down change' event from pop up
     */
    static changeEnvListener() {
        chrome.runtime.onMessage.addListener(async (request) => {
            if (request.URLChange) {
                contextMenus.updateCurrentEnvironment();
            }
        });
    };
}