/**
 * Insert text to HTML element which is in focus at the moment
 * @param {String} text
 */
let insertText = (text) => {
    document.activeElement.value = text
};

/**
 * Convert found DOM elements to objects and send them
 * @param resultArray
 */
let sendFoundDOMElements = (resultArray) => {
    // Convert HTML object to regular object with required parameters
    resultArray = resultArray.map(element => {
        return {
            type: element.type,
            tagName: element.tagName,
            name: element.name,
            value: element.value,
            cssSelector: QAASelector.buildUniqueCSSSelector(element)
        }
    });
    // Send new array to pop up
    chrome.runtime.sendMessage({resultDOM: resultArray})
};

/**
 * Listen for request from pop up to scan the page
 */
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
            sendFoundDOMElements(pageAllElements);
        } else if (request.scanDOM === 'scanInputs') {
            // Remove odd checkbox results
            pageInputsArray = pageInputsArray.filter(arr => arr.type !== 'checkbox').filter(arr => arr.name !== "");
            sendFoundDOMElements(pageInputsArray);
        } else if (request.scanDOM === 'scanCheckboxes') {
            // Leave only checkbox results
            pageInputsArray = pageInputsArray.filter(arr => arr.type === 'checkbox');
            sendFoundDOMElements(pageInputsArray);
        } else if (request.scanDOM === 'scanFilled') {
            // Search only for not empty fields
            pageInputsArray = pageInputsArray.filter(arr => arr.value !== "");
            pageSelectsArray = pageSelectsArray.filter(arr => arr.value !== "");
            let pageAllElements = pageInputsArray.concat(pageSelectsArray);
            sendFoundDOMElements(pageAllElements);
        } else if (request.scanDOM === 'scanSelectors') {
            sendFoundDOMElements(pageSelectsArray);
        }
    }
});

/**
 * Fill page elements with data
 */
let fillPageElements = (elementsArray) => {
    elementsArray.map((e) => {
        // console.log(e.cssSelector);
        if (e.cssSelector) {
            console.log("selector: " + e.cssSelector);
            console.log("value: " + e.value);
            console.log(document.querySelector(e.cssSelector));
            document.querySelector(e.cssSelector).value = e.value;
        }
    })
};

// WIP
// Handles response from background scripts
// Waits for array of elements to be filled
chrome.runtime.onMessage.addListener((request) => {
    if (request.setActiveTemplate) {
        console.log(request.setActiveTemplate);
        fillPageElements(request.setActiveTemplate)
    }
});

// Class to handle all 'search for unique CSS selector' operations
class QAASelector {
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
    static checkForUniqueClass(element) {
        let result = null;
        let i = 0;
        while (element.classList[i]) {
            if (!document.querySelectorAll(`.${element.classList[i]}`)[1]) {
                result = element.classList[i];
                break;
            }
            i++;
        }
        return result;
    };

    /**
     * Search for unique class in array
     * @param nodesTree
     * @returns {*}
     */
    static checkForUniqueParentClass(nodesTree) {
        let result = null;
        let i = 0;
        while (nodesTree[i]) {
            if (QAASelector.checkForUniqueClass(nodesTree[i])) {
                result = "." + QAASelector.checkForUniqueClass(nodesTree[i]);
                break;
            }
            i++;
        }
        return result;
    };

    /**
     * Simply check if selector point to unique element
     * @param selector
     * @returns {boolean}
     */
    static checkIfUnique(selector) {
        if (!document.querySelectorAll(selector)[1]) {
            return true;
        } else return false;
    };

    /**
     * Find unique css selector for element
     * @param element
     * @returns {string}
     */
    static buildUniqueCSSSelector(element) {
        // 	Check if element has id
        //  so any other checks may be redundant
        if (element.id) {
            return "[id='" + element.id + "']";
        }
        // 	Check if name attribute is present
        //  it will be added to all class sequences
        let name = "";
        if (element.name) {
            name = "[name='" + element.name + "']";
            if (QAASelector.checkIfUnique(name)) {
                return name;
            }
        }
        // Search for unique class in parent nodes
        // Concatenate parent unique class with element.name
        let nodesTree = QAASelector.getParentNodes(element);
        if (QAASelector.checkForUniqueParentClass(nodesTree)) {
            if (QAASelector.checkIfUnique(QAASelector.checkForUniqueParentClass(nodesTree) + " " + name)) {
                return QAASelector.checkForUniqueParentClass(nodesTree) + " " + name;
            }
        }
        // 	Check if element has unique class
        //  so any other checks may be redundant
        if (QAASelector.checkForUniqueClass(element)) {
            return "." + QAASelector.checkForUniqueClass(element);
        }
    }
}

/**
 * Listener which waits for context menu items to be clicked
 */
chrome.runtime.onMessage.addListener((request) => request.onClick && insertText(request.onClick));
