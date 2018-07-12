import {contextMenus} from "./contextMenus.js";
import System from "./core/system.js";
import ContextMenusEvents from "./core/contextMenusEvents.js";

/**
 * Call all required method to:
 * - create context menus
 * - add onClicked event listeners to created context menus
 */
let setup = () => {
    System.init();

    // Add all menu items to context menu
    contextMenus.addMultipleItems();

    //  Initialize onClicked event handler for all context menus
    ContextMenusEvents.multipleOnClickedSetup();
};

setup();
