// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     var selectedArea = document.activeElement;
//
//     if(request.onClick) {
//         console.log("=======>>>>> Message 'onClick' have been got");
//         selectedArea.value = request.onClick;
//     }
//
//     // var selectedTextArea = document.activeElement;
//     // selectedTextArea.value = "someText!!!!1";
//     // console.log("=======>>>>> Active element " + selectedTextArea);
// });

var insertText = function (text) {
    var selectedArea = document.activeElement;
    selectedArea.value = text;
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
   if(request.onClick) {
       console.log("=====>>>>> message have been got from background page");
       insertText(request.onClick);
   }
});