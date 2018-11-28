/**
 * Insert text to HTML element which is in focus at the moment
 * @param {String} text
 */
let insertText = (text) => {
    document.activeElement.value = text
};

/**
 * Listener which waits for context menu items to be clicked
 */
chrome.runtime.onMessage.addListener((request) => request.onClick && insertText(request.onClick));

let sendFoundDOMElements = (resultArray) => {
    // Debug
    console.log('++++++++++ resultArray ++++++++++');
    console.log(resultArray);

    resultArray = resultArray.map(element => {
        return {
            type: element.type,
            tagName: element.tagName,
            name: element.name
        }
    });
    chrome.runtime.sendMessage({resultDOM: resultArray})
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('++++++++++++++++++++++++++++++++++++++++++++++');
    if (request.scanDOM) {
        // Scan for all the page <input> tag
        let pageInputsObject = document.getElementsByTagName('input');

        // Formatting pageInputsObject to pageInputsArray
        let pageInputsArray = [];
        for (let i = 0; i < pageInputsObject.length; i++) {
            pageInputsArray[i] = pageInputsObject[i];
        }

        // Debug
        console.log('++++++++++ pageInputsArray before filter ++++++++++');
        console.log(pageInputsArray);

        // Check what is in request and do related functions
        if (request.scanDOM === 'scanAll') {
            // Remove odd empty results
            pageInputsArray = pageInputsArray.filter(arr => arr.name !== "");
            sendFoundDOMElements(pageInputsArray);
        } else if (request.scanDOM === 'scanInputs') {
            // Remove odd checkbox results
            pageInputsArray = pageInputsArray.filter(arr => arr.type !== 'checkbox').filter(arr => arr.name !== "");
            sendFoundDOMElements(pageInputsArray);
        } else if (request.scanDOM === 'scanCheckboxes') {
            // Leave only checkbox results
            pageInputsArray = pageInputsArray.filter(arr => arr.type === 'checkbox');
            sendFoundDOMElements(pageInputsArray);
        }
    }
});

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     console.log('++++++++++++++++++++++++++++++++++++++++++++++');
//     if (request.scanDOM) {
//         // Scan for all the page <input> tag
//         let pageInputsObject = document.getElementsByTagName('input');
//
//         // Formatting pageInputsObject to pageInputsArray
//         let pageInputsArray = [];
//         for (let i = 0; i < pageInputsObject.length; i++) {
//             pageInputsArray[i] = pageInputsObject[i];
//         }
//
//         // Remove odd checkboxes results
//         pageInputsArray = pageInputsArray.filter(arr => arr.type !== 'checkbox').filter(arr => arr.name !== "");
//
//         // Debug
//         console.log('++++++++++ pageInputsArray below ++++++++++');
//         console.log(pageInputsArray)
//     }
// });