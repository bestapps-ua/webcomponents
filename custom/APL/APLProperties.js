class APLProperties {
    static encode(component, key, value) {
        function setStyle(key, value, property) {
            let options = property.options;
            let val = value;
            if (typeof val !== 'undefined') {
                if (property.type === 'dimension') {
                    val = component.getFactory().getScreen().getSizePixels(val);
                }

                if (property.type === 'list') {
                    for (const item of property.items) {
                        if (typeof item === 'object') {
                            let keys = Object.keys(item);
                            if (item[keys[0]] === val) {
                                val = keys[0];
                                break;
                            }
                        } else if (item === val) {
                            break;
                        }
                    }
                }
            }
            if (options?.wrapper) {
                //console.log(key, val);
                component.element.wrapper.style[key] = val;
            } else {
                component.style[key] = val;
            }
        }

        let data = component.getAPLData();
        let properties = component.getAPLProperties();
        let property = properties[key];
        const apl = property.options?.apl;
        let aplProperty = apl || key;
        data[aplProperty] = value;

        const cssConfig = property.options?.css;
        if (cssConfig) {
            if (Array.isArray(cssConfig)) {
                for (const cssKey of cssConfig) {
                    setStyle(cssKey, value, property);
                }
            } else {
                let cssKey = key;
                if (cssConfig !== true) {
                    cssKey = cssConfig;
                }
                setStyle(cssKey, value, property);
            }
        }

        if (properties.onCSSSet) {
            properties.onCSSSet();
        }
    }

    static decodeByComponent(component) {
        let properties = component.getAPLProperties();
        let data = component.getAPLData();
        return this.decode(properties, data, component);
    }

    static decode(properties, data = {}, component = undefined) {
        let props = {};
        try {

            for (const key in properties) {
                if (key === 'onCSSSet') {
                    continue;
                }
                let property = properties[key];
                try {
                    const apl = property.options?.apl;
                    const aplProperty = property.options?.property;
                    let value;
                    if (apl) {
                        value = data[apl];
                        if (!value && component) {
                            value = component[`getAPL${aplProperty[0].toUpperCase()}${aplProperty.slice(1)}`]();
                        }
                    } else if (aplProperty) {
                        if(component) {
                            value = component[`getAPL${aplProperty[0].toUpperCase()}${aplProperty.slice(1)}`]();
                        }
                    } else {
                        value = data[key];
                    }
                    if (typeof value === 'undefined') {
                        value = property.default || '';
                    }
                    props[key] = JSON.parse(JSON.stringify(property));
                    props[key].value = value;
                    properties[key].value = value;
                } catch (err) {
                    console.warn('[err decodeByComponent property]', {err, key, property, component});
                }
            }

        } catch (err) {
            console.warn('[err decode]', {err, properties});
        }
        return props;
    }

    static getAlignmentAndPositioningProperties() {
        return {
            left: {
                type: 'dimension',
                options: {
                }
            },
            top: {
                type: 'dimension',
                options: {
                }
            },
            right: {
                type: 'dimension',
                options: {
                }
            },
            bottom: {
                type: 'dimension',
                options: {
                }
            }
        }
    }
    static getContainerProperties() {
        return {
            position: {
                type: 'list',
                items: [
                    'relative',
                    'absolute',
                    'sticky',
                ],
                default: 'relative',
                options: {
                    css: true,
                }
            },
        }
    }
}