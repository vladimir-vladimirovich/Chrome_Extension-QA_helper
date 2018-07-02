import {contextMenus} from "./contextMenus.js";
import {contextMenusEvents} from "./core/contextMenusEvents.js";
import {menuCollection} from "./templates/menuCollection.js";
import {checkDefaultURL} from "./core/system.js";

/**
 * Call all required method to:
 * - create context menus
 * - add onClicked event listeners to created context menus
 */
let setup = () => {
    checkDefaultURL();

    // Add all menu items to context menu
    contextMenus.addMultipleItems(menuCollection);

    //  Initialize onClicked event handler for all context menus
    contextMenusEvents.multipleOnClickedSetup();
};

setup();
