import {initializeEnvironmentGroup} from "./modules/environment.js";
import {setupEnvironmentEvents} from "./modules/environment.js";
import {setupDeviceList} from "./modules/deviceList.js";
import FormManager from "./modules/formManager.js";

initializeEnvironmentGroup();
setupEnvironmentEvents();
setupDeviceList();

let formManager = new FormManager();
formManager.setupFormManagerModule();