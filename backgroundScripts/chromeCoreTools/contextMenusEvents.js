define(['config/commentsCollection'], function (commentsCollection) {
    var contextMenusEvents = {};

    /**
     * Clicking on menu item with 'menuId' will send 'text' text to be pasted
     * @param {String} menuId
     * @param {String} text
     */
    contextMenusEvents.onClicked = function (menuId, text) {
        chrome.contextMenus.onClicked.addListener(function (menuItem) {
            if(menuItem.menuItemId === menuId) {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {onClick: text})
                })
            }
        });
    };

    /**
     * Add multiple context menu items
     */
    contextMenusEvents.multipleOnClickedSetup = function () {
        var array = Object.values(commentsCollection);
        array.forEach(function (t) {
            this.onClicked(t.id, t.text)
        }.bind(this))
    };

    return contextMenusEvents;
});