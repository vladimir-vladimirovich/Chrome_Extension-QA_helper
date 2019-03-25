let formManagerData = {
    selectors: {
        scanButton: "[id='scanDOM']",
        pasteFormButton: "[id='pasteFormButton']",
        scanOptions: "[id='scanOptions']",
        scanResultsArea: "[id='scanResultsArea']",
        formTemplateSelector: "[id='formTemplateSelector']",
        addFormTemplateInput: "[id='addFormTemplateInput']",
        addFormTemplateButton: "[id='addFormTemplateButton']"
    },
    storage: {
        scanResults: "scanResults",
        formTemplates: "formTemplates",
        activeFormTemplate: "activeFormTemplate"
    }
};

export default formManagerData;