let validationData = {
    regex: {
        envURL: /^[^-\s][a-zA-Z0-9_.:\/\s-]+$/,
        versionPath: /^[^-\s][a-zA-Z0-9_.:\/\s-]+$/,
        deviceInput: /^[^-\s][a-zA-Z0-9_.:#\/\s-]+$/,
        formInput: /^[^-\s][a-zA-Z0-9_.:#\s-]+$/
    },
    classes: {
        danger: "bg-danger text-white"
    }
};

export default validationData;