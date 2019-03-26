let formManagerData = {
    selectors: {
        scanButton: "[id='scanDOM']",
        pasteFormButton: "[id='pasteFormButton']",
        scanOptions: "[id='scanOptions']",
        scanResultsArea: "[id='scanResultsArea']",
        formTemplateSelector: "[id='formTemplateSelector']",
        addFormTemplateInput: "[id='addFormTemplateInput']",
        addFormTemplateButton: "[id='addFormTemplateButton']",
        removeFormTemplateButton: "[id='deleteFormTemplateButton']",
        expandFormTemplateButton: "[id='expandFormTemplateButton']"
    },
    storage: {
        scanResults: "scanResults",
        formTemplates: "formTemplates",
        activeFormTemplate: "activeFormTemplate"
    },
    option: {
        notChosen: "Not chosen"
    }
};

export default formManagerData;