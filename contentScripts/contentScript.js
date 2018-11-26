/**
 * Insert text to HTML element which is in focus at the moment
 * @param {String} text
 */
let insertText = (text) => {document.activeElement.value = text};

/**
 * Listener which waits for context menu items to be clicked
 */
chrome.runtime.onMessage.addListener((request) => request.onClick && insertText(request.onClick));