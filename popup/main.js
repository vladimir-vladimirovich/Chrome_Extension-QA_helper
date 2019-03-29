import {initializeEnvironmentGroup} from "./modules/environment.js";
import {setupEnvironmentEvents} from "./modules/environment.js";
import {setupDeviceList} from "./modules/deviceList.js";
import FormManager from "./modules/formManager.js";
import EnvironmentManager from "./modules/environmentManager.js";

// initializeEnvironmentGroup();
// setupEnvironmentEvents();
setupDeviceList();

let formManager = new FormManager();
formManager.setupFormManagerModule();

let environmentManager = new EnvironmentManager();
// environmentManager.initializeEnvironmentsStorage();
// environmentManager.initializeSetDefaultActiveGroup();
// environmentManager.setupChangeActiveGroupEvent();
environmentManager.setup();