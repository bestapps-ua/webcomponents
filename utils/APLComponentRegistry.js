const APLComponentRegistry = {};

function registerAPLComponent(schemaType, componentClass) {
    APLComponentRegistry[schemaType] = componentClass;
}

function getAPLComponentClass(schemaType) {
    return APLComponentRegistry[schemaType];
}

function getRegisteredAPLTypes() {
    return Object.keys(APLComponentRegistry);
}
