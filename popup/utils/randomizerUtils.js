import randomizerData from "../data/randomizerData.js";

export default class RandomizerUtils {
    /**
     * Generate random internal email
     */
    static getRandomInternalEmail() {
        let result = Math.floor(Math.random() * 10);
        for (let i = 0; i < 7; i++) {
            result = result.toString() + Math.floor(Math.random() * 10);
        }
        return "test." + result + ".a1@playtech.com";
    };

    /**
     * Generate random internal email
     */
    static getRandomRealEmail() {
        let result = Math.floor(Math.random() * 10);
        for (let i = 0; i < 7; i++) {
            result = result.toString() + Math.floor(Math.random() * 10);
        }
        return "real." + result + ".a1@playtech.com";
    };

    /**
     * Return random string based on pattern
     * @param pattern {String} - Example: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
     * @param length {Number}
     */
    static getRandomString(pattern, length) {
        let result = "";
        for (let i = 0; i < length; i++)
            result += pattern.charAt(Math.floor(Math.random() * pattern.length));
        return result;
    };

    /**
     * Return valid phone number starting from 0
     */
    static getRandomMobileNumber() {
        return 0 + RandomizerUtils.getRandomString(randomizerData.numbers, 12);
    }
}