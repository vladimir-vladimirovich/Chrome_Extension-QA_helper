/**
 * Insert text to HTML element which is in focus at the moment
 * @param {String} text
 */
var insertText = function (text) {
    var selectedArea = document.activeElement;
    selectedArea.value = text;
};

/**
 * Listener which waits for context menu items to be clicked
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
   if(request.onClick) {
       insertText(request.onClick);
   }
});