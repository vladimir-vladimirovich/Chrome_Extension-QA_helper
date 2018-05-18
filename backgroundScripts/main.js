require.config({
    baseUrl: chrome.runtime.getURL("backgroundScripts/")
});

require([
        'contextMenus',
        'config/menuCollection',
        'config/commentsCollection',
        'chromeCoreTools/contextMenusEvents'
    ],
    function (contextMenus, menuCollection, commentsCollection, contextMenusEvents) {

        /**
         * Call all required method to:
         * - create context menus
         * - add onClicked event listeners to created context menus
         */
        var setup = function () {
            //  Initialize onClicked event handler for all context menus
            contextMenusEvents.multipleOnClickedSetup();

            //  Initialize CPH context menu
            contextMenus.addMenuItem(menuCollection.CPH);
            //  Initialize comments context menu
            contextMenus.addMultipleItems(menuCollection.comments);
            //  Initialize description context menu
            contextMenus.addMenuItem(menuCollection.description);
        };

        setup();
});