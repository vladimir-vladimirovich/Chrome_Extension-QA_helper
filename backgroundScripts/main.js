import {contextMenus} from "./contextMenus.js";
import ContextMenusEvents from "./core/contextMenusEvents.js";
import EnvManagerHandler from "./popupHandlers/envManagerHandler.js";
import DeviceManagerHandler from "./popupHandlers/deviceManagerHandler.js";

/**
 * Call all required method to:
 * - create context menus
 * - add onClicked event listeners to created context menus
 */
let setup = () => {
    // System.init();

    // Add all menu items to context menu
    contextMenus.addMultipleItems();

    //  Initialize onClicked event handler for all context menus
    ContextMenusEvents.multipleOnClickedSetup();

    // Update QAA context menu with active projectProperties
    contextMenus.updateCurrentEnvironment();

    EnvManagerHandler.initializeActiveEnvStorage()
        .then(() => {
            return EnvManagerHandler.initializeActiveVersionStorage();
        })
        .then(() => {
            EnvManagerHandler.getActiveVersion();
            EnvManagerHandler.changeEnvListener();
        });

    DeviceManagerHandler.checkDefaultDevicesList();
    DeviceManagerHandler.deviceListChangedListener();
};

setup();
