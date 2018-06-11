define([
        'config/commentsCollection',
        'config/projectProperties'
], function (commentsCollection, projectProperties) {

    var inner = {
        commentVersionStart: ' |\n' +
        '| *Version stamp:* | ',
        commentVersionEnd: ' |\n' +
        '{panel}',

        /**
         * Comment constructor
         * @param menuId
         * @param text
         * @param version
         * @return {*}
         */
        combineStrings: function (menuId, text, version) {
            if(menuId.indexOf('comment') !== -1) {
                return text + projectProperties.environment.defaultURL + this.commentVersionStart + version + this.commentVersionEnd;
            } else if(menuId === 'description') {
                return text + projectProperties.environment.defaultURL + '\n' + version;
            } else return 'ERROR'
        }
    };

    var contextMenusEvents = {};

    /**
     * 1. This method connects different menu items to text that will be pasted after click on them
     * 2. Before to post a comment it goes to chrome local storage and takes stringified and cut version.json
     *      and adds it to a comment
     * @param menuId
     * @param text
     */
    contextMenusEvents.onClicked = function (menuId, text) {
        chrome.contextMenus.onClicked.addListener(function (menuItem) {
            if(menuItem.menuItemId === menuId) {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.storage.local.get(['versionJSON'], function (version) {
                        console.log(version.versionJSON);
                        var result = inner.combineStrings(menuId, text, version.versionJSON);
                        chrome.tabs.sendMessage(tabs[0].id, {onClick: result})
                    });
                })
            }
        });
    };

    /**
     * Initialize all context menu items
     */
    contextMenusEvents.multipleOnClickedSetup = function () {
        var array = Object.values(commentsCollection);
        array.forEach(function (t) {
            this.onClicked(t.id, t.text)
        }.bind(this));
    };

    return contextMenusEvents;
});














