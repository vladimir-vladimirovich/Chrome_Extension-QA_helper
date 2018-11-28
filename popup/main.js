import {initializeEnvironmentGroup} from "./modules/environment.js";
import {setupEnvironmentEvents} from "./modules/environment.js";
import {setupDeviceList} from "./modules/deviceList.js";
import {setupFormFiller} from "./modules/formFiller.js";

initializeEnvironmentGroup();
setupEnvironmentEvents();
setupDeviceList();
setupFormFiller();