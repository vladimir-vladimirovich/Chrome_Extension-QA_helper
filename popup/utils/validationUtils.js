import validationData from "../data/validationData.js";

export default class ValidationUtils {
    /**
     * Check if 'string' is exist in
     * @param string
     * @param expression
     * @return {*|boolean}
     */
    static isValid(string, expression) {
        return expression.test(string);
    };

    /**
     * Setup validation for some field
     * @param element
     * @param string
     * @param expression
     */
    static validateInputField(element, string, expression) {
        if (ValidationUtils.isValid(string, expression)) {
            $(element).removeClass(validationData.classes.danger);
            return true
        } else {
            $(element).addClass(validationData.classes.danger);
            return false
        }
    }
}