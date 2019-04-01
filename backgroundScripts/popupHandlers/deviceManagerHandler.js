import {customComments} from "../templates/cutomsComments.js";
import deviceManagerData from "../data/deviceManagerData.js";

export default class DeviceManagerHandler {
    /**
     * @param devicesArray
     * @return {string}
     */
    static formatDevicesArrayToString(devicesArray) {
        let formattedDeviceList = " ";
        for (let i = 0; i < devicesArray.length; i++) {
            // Do not set '\n' on last string
            if (i === devicesArray.length - 1) {
                formattedDeviceList = formattedDeviceList + "- " + devicesArray[i]
            } else formattedDeviceList = formattedDeviceList + "- " + devicesArray[i] + '\n';
        }
        return formattedDeviceList;
    };

    /**
     * Set default(saved) values to paste templates
     */
    static checkDefaultDevicesList() {
        chrome.storage.local.get(deviceManagerData.storage.selectedDevicesStorage, function (result) {
            console.log(result[deviceManagerData.storage.selectedDevicesStorage]);
            if (result[deviceManagerData.storage.selectedDevicesStorage] !== undefined) {
                customComments.devices = DeviceManagerHandler.formatDevicesArrayToString(result[deviceManagerData.storage.selectedDevicesStorage]);
            }
        })
    };

    /**
     * Listen to device list changes in pop up
     */
    static deviceListChangedListener() {
        chrome.runtime.onMessage.addListener(request => {
            if (request.deviceListChange) {
                customComments.devices = DeviceManagerHandler.formatDevicesArrayToString(request.deviceListChange);
            }
        })
    };
}