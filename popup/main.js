import {initializeEnvironmentGroup} from "./modules/environment.js";
import {setupEnvironmentEvents} from "./modules/environment.js";
import {setupDeviceList} from "./modules/deviceList.js";
import FormManagerOld from "./modules/formManagerOld.js";
import FormManagerNew from "./modules/formManagerNew.js";
// import {setupFormFillerModule} from "./modules/formFiller.js";

initializeEnvironmentGroup();
setupEnvironmentEvents();
setupDeviceList();
// setupFormFillerModule();

let formManagerNew = new FormManagerNew();
formManagerNew.initializeStorage();
formManagerNew.setupResultDOMListener();
formManagerNew.setupScanButtonClickEvent();

// let formManagerOld = new FormManagerOld();
// formManagerOld.setupScanButtonClickEvent();
// formManagerOld.setupResultDOMListener();
// formManagerOld.setDefaultPlaceholder();
// formManagerOld.setupAddTemplateButtonClickEvent();
// formManagerOld.setupTemplatesDropDown();