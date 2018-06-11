require.config({
    baseUrl: chrome.runtime.getURL("backgroundScripts/")
});

require([
        'contextMenus',
        'config/menuCollection',
        'core/contextMenusEvents',
        'core/requestHandler'
    ],
    function (contextMenus, menuCollection, contextMenusEvents, requestHandler) {

        /**
         * Call all required method to:
         * - create context menus
         * - add onClicked event listeners to created context menus
         */
        var setup = function () {
            // Initialize version.json request
            requestHandler.getVersionJSON(function () {
                console.log('[-_-] Initialize version.json request');
            });

            // Add all menu items to context menu
            contextMenus.addMultipleItems(menuCollection);

            //  Initialize onClicked event handler for all context menus
            contextMenusEvents.multipleOnClickedSetup();
        };

        setup();

});