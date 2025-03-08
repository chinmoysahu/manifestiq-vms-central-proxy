function setDefaultIfUndefined(config, key, defaultValue) {
    const mustDoDefault = !config.userHasSubscribed;
    if (Array.isArray(defaultValue)) {
        if (config[key] === undefined || mustDoDefault) {
            config[key] = [...defaultValue]; // Spread operator to clone the array
        }
    } else {
        if (config[key] === undefined || mustDoDefault) {
            config[key] = defaultValue;
        }
    }
}
module.exports = {
    setDefaultIfUndefined,
}
