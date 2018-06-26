import {contextMenus} from "./contextMenus.js";
import {contextMenusEvents} from "./core/contextMenusEvents.js";
import {menuCollection} from "./templates/menuCollection.js";
import {requests} from "./core/requestHandler.js";

/**
 * Call all required method to:
 * - create context menus
 * - add onClicked event listeners to created context menus
 */
let setup = () => {
    // Initialize version.json request
    requests.getVersionJSON(function () {
        console.log('[-_-] Initialize version.json request');
    });

    // Add all menu items to context menu
    contextMenus.addMultipleItems(menuCollection);

    //  Initialize onClicked event handler for all context menus
    contextMenusEvents.multipleOnClickedSetup();
};

setup();
