/**
 * Class to describe all content-backgroundScripts communication
 */
class QAABackgroundScriptsCommunication {
    /**
     * Listener which waits for context menu items to be clicked
     */
    static listenForContextMenuClick() {
        chrome.runtime.onMessage.addListener((request) => request.onClick && QAAPageElement.insertText(request.onClick));
    }
}

/**
 * Class to describe all content-popup communications
 */
class QAAPopupCommunication {
    /**
     * Convert found DOM elements to objects and send them
     * @param resultArray
     */
    static sendFoundDOMElements(resultArray) {
        resultArray = resultArray.map(element => {
            return {
                type: element.type,
                tagName: element.tagName,
                name: element.name,
                value: element.value,
                cssSelectors: QAAPageElement.getUniqueSelectors(element),
                state: "None"
            }
        });
        // Send new array to pop up
        chrome.runtime.sendMessage({resultDOM: resultArray})
    };

    /**
     * Listen for request from pop up to scan the page
     */
    static listenForPageScan() {
        chrome.runtime.onMessage.addListener(function (request) {
            if (request.scanDOM) {
                // Scan for all the page <input> tags
                let pageInputsObject = document.getElementsByTagName('input');
                let pageSelectsObject = document.getElementsByTagName('select');
                // Formatting pageInputsObject to pageInputsArray
                let pageInputsArray = [];
                for (let i = 0; i < pageInputsObject.length; i++) {
                    pageInputsArray[i] = pageInputsObject[i];
                }
                // Formatting pageSelectsObject to pageSelectsArray
                let pageSelectsArray = [];
                for (let i = 0; i < pageSelectsObject.length; i++) {
                    pageSelectsArray[i] = pageSelectsObject[i];
                }
                // Check what is in request and do related functions
                if (request.scanDOM === 'scanAll') {
                    // Remove odd result w/o name tag
                    pageInputsArray = pageInputsArray.filter(arr => arr.name !== "");
                    let pageAllElements = pageInputsArray.concat(pageSelectsArray);
                    QAAPopupCommunication.sendFoundDOMElements(pageAllElements);
                } else if (request.scanDOM === 'scanInputs') {
                    // Remove odd checkbox results
                    pageInputsArray = pageInputsArray.filter(arr => arr.type !== 'checkbox').filter(arr => arr.name !== "");
                    QAAPopupCommunication.sendFoundDOMElements(pageInputsArray);
                } else if (request.scanDOM === 'scanCheckboxes') {
                    // Leave only checkbox results
                    pageInputsArray = pageInputsArray.filter(arr => arr.type === 'checkbox');
                    QAAPopupCommunication.sendFoundDOMElements(pageInputsArray);
                } else if (request.scanDOM === 'scanFilled') {
                    // Search only for not empty fields
                    pageInputsArray = pageInputsArray.filter(arr => arr.value !== "");
                    pageSelectsArray = pageSelectsArray.filter(arr => arr.value !== "");
                    let pageAllElements = pageInputsArray.concat(pageSelectsArray);
                    QAAPopupCommunication.sendFoundDOMElements(pageAllElements);
                } else if (request.scanDOM === 'scanSelectors') {
                    QAAPopupCommunication.sendFoundDOMElements(pageSelectsArray);
                }
            }
        });
    };

    /**
     * Handles response from background scripts
     * Waits for array of elements to be filled
     */
    static listenForFillForm() {
        chrome.runtime.onMessage.addListener((request) => {
            if (request.setActiveTemplate) {
                QAAPageElement.fillPageElements(request.setActiveTemplate);
            }
        });
    }
}

// Class to handle all 'search for unique CSS selector' operations
class QAAPageElement {
    /**
     * Insert text to HTML element which is in focus at the moment
     * @param {String} text
     */
    static insertText = (text) => {
        document.activeElement.value = text
    };

    /**
     * Fill page elements with data
     */
    static fillPageElements = (elementsArray) => {
        elementsArray.forEach((element) => {
            let validSelector = element.cssSelectors.find((cssSelector) => {
                return document.querySelector(cssSelector);
            });
            if (validSelector) {
                document.querySelector(validSelector).value = element.value;
                QAAPageElement.triggerChangeEvent(validSelector);
            }
        });
    };

    /**
     * Returns array of all parent nodes. Parent of parent and etc.
     * @param element
     * @returns {Array}
     */
    static getParentNodes(element) {
        let parentsTree = [];
        while (element) {
            parentsTree.push(element);
            element = element.parentNode;
        }
        return parentsTree;
    };

    /**
     * Check if HTML element has unique class
     * @param element
     * @returns {*}
     */
    static getUniqueClass(element) {
        let resultUniqueClass = null;
        let i = 0;
        while (element.classList[i]) {
            if (!document.querySelectorAll(`.${element.classList[i]}`)[1]) {
                resultUniqueClass = element.classList[i];
                break;
            }
            i++;
        }
        return resultUniqueClass;
    };

    /**
     * Search for unique combination: (non-unique parent class + non-unique element's name) = unique selector
     * @param nodesTree
     * @param selector
     */
    static getParentClassPlusElementSelector(nodesTree, selector) {
        let resultUniqueSelector = null;
        // Flag to stop the cycle
        let status = false;
        let i = 0;
        while (nodesTree[i]) {
            let j = 0;
            // Do checks for elements with class attribute only
            if (nodesTree[i].classList) {
                while (nodesTree[i].classList[j]) {
                    // Ignore validation classes because they are too dynamic
                    if (nodesTree[i].classList[j] !== "valid" && nodesTree[i].classList[j] !== "invalid") {
                        if (QAAPageElement.checkIfUnique(`.${nodesTree[i].classList[j]} ${selector}`)) {
                            resultUniqueSelector = `.${nodesTree[i].classList[j]} ${selector}`;
                            status = true;
                            break;
                        }
                    }
                    j++;
                }
            }
            if (status) {
                break;
            }
            i++;
        }
        return resultUniqueSelector;
    };

    /**
     * Search for unique combination: (parent attribute + non-unique element's name) = unique selector
     * @param nodesTree
     * @param selector
     * @return {*}
     */
    static getParentAttributePlusElementSelector(nodesTree, selector) {
        let resultUniqueSelector = null;
        // Flag to stop the cycle
        let status = false;
        let m = 0;
        while (nodesTree[m]) {
            let n = 0;
            if (nodesTree[m].attributes) {
                while (nodesTree[m].attributes[n]) {
                    if (nodesTree[m].attributes[n].nodeName !== "class" && nodesTree[m].attributes[n].nodeName !== "style") {
                        if (QAAPageElement.checkIfUnique(
                            `[${nodesTree[m].attributes[n].nodeName}=\"${nodesTree[m].attributes[n].value}\"] ${selector}`)
                        ) {
                            resultUniqueSelector = `[${nodesTree[m].attributes[n].nodeName}=\"${nodesTree[m].attributes[n].value}\"] ${selector}`;
                            status = true;
                            break;
                        }
                    }
                    n++;
                }
            }
            if (status) {
                break;
            }
            m++;
        }
        return resultUniqueSelector;
    };

    /**
     * Simply check if selector point to unique element
     * @param selector
     * @returns {boolean}
     */
    static checkIfUnique(selector) {
        if (selector && document.querySelector(selector)) {
            return !document.querySelectorAll(selector)[1];
        }
    };

    /**
     * Scan for all element's attributes and combine them to CSS selector
     * Class attribute removed from combination
     * @param element
     */
    static buildAttributesSelector(element) {
        let resultSelector = "";
        let i = 0;
        while (element.attributes[i]) {
            if (element.attributes[i].nodeName !== "class") {
                resultSelector = resultSelector + "[" + element.attributes[i].nodeName + "=\"" + element.attributes[i].value + "\"]";
            }
            i++;
        }
        return resultSelector;
    };

    /**
     * Search for unique CSS selectors for element
     * @param element
     */
    static getUniqueSelectors(element) {
        let selectorsArray = [];
        if (QAAPageElement.buildUniqueCSSSelectorTypeOne(element)) {
            selectorsArray.push(QAAPageElement.buildUniqueCSSSelectorTypeOne(element))
        }
        if (QAAPageElement.buildUniqueCSSSelectorTypeTwo(element)) {
            selectorsArray.push(QAAPageElement.buildUniqueCSSSelectorTypeTwo(element))
        }
        if (QAAPageElement.buildUniqueCSSSelectorTypeThree(element)) {
            selectorsArray.push(QAAPageElement.buildUniqueCSSSelectorTypeThree(element))
        }
        return selectorsArray;
    }

    /**
     * Find unique css selector for element
     * See possible result below in priority order
     * 1: unique ID
     * 2: unique name
     * 3: (parent class + non unique name) = unique selector
     * 4: unique class
     * @param element
     * @returns {string || null}
     */
    static buildUniqueCSSSelectorTypeOne(element) {
        // 1
        if (element.id) {
            return "[id=\'" + element.id + "\']";
        }
        // 2
        let name = "";
        if (element.name) {
            name = "[name=\'" + element.name + "\']";
            if (QAAPageElement.checkIfUnique(name)) {
                return name;
            }
        }
        // 3
        if (name !== "") {
            let nodesTree = QAAPageElement.getParentNodes(element);
            if (QAAPageElement.getParentClassPlusElementSelector(nodesTree, name)) {
                return QAAPageElement.getParentClassPlusElementSelector(nodesTree, name);
            }
        }
        // 4
        if (QAAPageElement.getUniqueClass(element)) {
            return "." + QAAPageElement.getUniqueClass(element);
        }
        return null;
    };

    /**
     * Build CSS selector based on element attributes except class
     * @param element
     */
    static buildUniqueCSSSelectorTypeTwo(element) {
        let attributesSelector = QAAPageElement.buildAttributesSelector(element);
        if (QAAPageElement.checkIfUnique(attributesSelector)) {
            return attributesSelector;
        } else return null;
    };

    /**
     * Search for unique combination: (parent attribute + non-unique element's name) = unique selector
     * @param element
     * @return {*}
     */
    static buildUniqueCSSSelectorTypeThree(element) {
        if (element.name) {
            let parentTree = QAAPageElement.getParentNodes(element);
            return QAAPageElement.getParentAttributePlusElementSelector(parentTree, `[name='${element.name}']`);
        } else return null;
    };

    /**
     * Trigger dispatchEvent for element
     * @param selector
     */
    static triggerChangeEvent(selector) {
        let event = document.createEvent('Event');
        event.initEvent('change', true, true);
        document.querySelector(selector).dispatchEvent(event);
    }
}

QAAPopupCommunication.listenForPageScan();
QAAPopupCommunication.listenForFillForm();
QAABackgroundScriptsCommunication.listenForContextMenuClick();

