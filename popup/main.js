import {setupDeviceList} from "./modules/deviceList.js";
import FormManager from "./modules/formManager.js";
import EnvManager from "./modules/envManager.js";

setupDeviceList();

let formManager = new FormManager();
formManager.setupFormManagerModule();

let environmentManager = new EnvManager();
environmentManager.setup();