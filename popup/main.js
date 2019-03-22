import {initializeEnvironmentGroup} from "./modules/environment.js";
import {setupEnvironmentEvents} from "./modules/environment.js";
import {setupDeviceList} from "./modules/deviceList.js";
import FormManager from "./modules/formManager.js";
// import {setupFormFillerModule} from "./modules/formFiller.js";

initializeEnvironmentGroup();
setupEnvironmentEvents();
setupDeviceList();
// setupFormFillerModule();

let formManager = new FormManager();
formManager.setupScanButtonClickEvent();
formManager.setupResultDOMListener();
formManager.setDefaultPlaceholder();
formManager.setupAddTemplateButtonClickEvent();
formManager.setupTemplatesDropDown();