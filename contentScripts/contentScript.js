/**
 * Insert text to HTML element which is in focus at the moment
 * @param {String} text
 */
let insertText = (text) => {
    document.activeElement.value = text
};

/**
 * Convert classList object to CSS selector of classes
 * @param {DOMTokenList} obj
 * @return {string} - CSS Selector
 */
let returnClassesSelector = function (obj) {
    let resultArray = [];
    let resultString = '';
    // Convert DOMTokenList to Array
    for (let i = 0; i < obj.length; i++) {
        resultArray[i] = obj[i];
    }
    // Convert array of classes to CSS selector string
    resultArray.map(function (arrayItem) {
        resultString = resultString + '.' + arrayItem
    });
    return resultString;
};

/**
 * Form CSS selector for element.
 * Use class list + name attribute if exists
 * @param element - DOM element
 * @return {*}
 */
let formCSSSector = function (element) {
    // Check if element exists
    if (element) {
        // Check if element.name exists
        if (element.name) {
            return returnClassesSelector(element.classList) + '[name="' + element.name + '"]';
        } else return returnClassesSelector(element.classList);
    } else return 'Element is missing'
};

/**
 * Get unique CSS selector build from attributes: class and name(if exists)
 * @param {Element} element
 * @param {String} childElementSelector
 * @return {*}
 */
let getUniqueSelector = function (element, childElementSelector) {
    // Combine CSS selector of element and his children's
    let jointSelector = formCSSSector(element) + ' ' + childElementSelector;
    if (document.querySelectorAll(jointSelector)[1]) {
        if (element.parentElement) {
            // Recursion function
            return getUniqueSelector(element.parentElement, jointSelector);
        } else return "Not able to find unique CSS selector";
    } else {
        return jointSelector;
    }
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
            cssSelector: getUniqueSelector(element, '')
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
 * Listener which waits for context menu items to be clicked
 */
chrome.runtime.onMessage.addListener((request) => request.onClick && insertText(request.onClick));
