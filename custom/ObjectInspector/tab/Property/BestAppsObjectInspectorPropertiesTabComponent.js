class BestAppsObjectInspectorPropertiesTabComponent extends BestAppsObjectInspectorTabComponent {
    static tag = 'ba-object-inspector-properties-tab-component';

    properties = [];

    getProperties() {
        return this.properties;
    }

    setProperties(properties) {
        this.properties = properties;
    }

    deactivateProperties(property) {
        for (const prop of this.properties) {
            if (prop !== property) {
                prop.deactivate();
            }
        }
    }

    /**
     * Optional (name, value, propertyDef) => string|null validator handed to
     * each property row. Default: no validation. Override in a domain layer to
     * drive per-type value validation (see the APL tab).
     */
    getValidator() {
        return null;
    }

    getClassByProperty(property) {
        //console.log('property', property);
        let cls = BestAppsObjectInspectorPropertyInputComponent;
        if (property.type === 'list') {
            cls = BestAppsObjectInspectorPropertyListComponent;
        }else if (property.type === 'array') {
            cls = BestAppsObjectInspectorPropertyArrayComponent;
        }
        return cls;
    }

    async initElements() {
        await super.initElements();
        this.element.wrapper.innerHTML = '';
        await this.layoutProperties(this.options.properties || {});
    }

    /**
     * Render the property rows. Default layout is a flat list in key order.
     * Override to group/sort rows; use createPropertyComponent to build each row
     * so event wiring stays consistent.
     */
    async layoutProperties(items) {
        for (const key in items) {
            let property = await this.createPropertyComponent(key, items[key]);
            if (property) {
                this.element.wrapper.appendChild(property);
            }
        }
    }

    /**
     * Build a single property row: create the element, wire its activate/changed
     * events, and register it in this.properties. Returns the element (not yet
     * attached to the DOM) or null when there is no matching component class.
     */
    async createPropertyComponent(key, prop) {
        let cls = this.getClassByProperty(prop);
        if (!cls) {
            return null;
        }

        let property = document.createElement(cls.tag);
        property.validator = this.getValidator();
        await property.setOptions({
            name: key,
            data: prop,
            tab: this,
        });

        property.subscribe(cls.EVENT_ACTIVATE, (data) => {
            this.deactivateProperties(property);
        });

        property.subscribe(cls.EVENT_CHANGED, (data) => {
            this.sendPropertyChanged({tabName: this.options.tabName, key, data: data.data});
        });

        this.properties.push(property);
        return property;
    }

    async update(data) {
        if(!Array.isArray(this.properties)){
            return ;
        }
        //console.log('fff>>>', this.getTabName(), Array.isArray(this.properties), this.properties);

        for (const key in data) {
            let property = this.findProperty(key);
            if (property) {
                property.processData(data[key], true);
            }
        }

    }

    findProperty(name) {
        return this.properties.find((item) => {
            return item.name === name;
        });
    }
}


customElements.define(BestAppsObjectInspectorPropertiesTabComponent.tag, BestAppsObjectInspectorPropertiesTabComponent);