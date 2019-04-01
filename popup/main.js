import {setupDeviceList} from "./modules/deviceList.js";
import FormManager from "./modules/formManager.js";
import EnvironmentManager from "./modules/environmentManager.js";

setupDeviceList();

let formManager = new FormManager();
formManager.setupFormManagerModule();

let environmentManager = new EnvironmentManager();
environmentManager.setup();