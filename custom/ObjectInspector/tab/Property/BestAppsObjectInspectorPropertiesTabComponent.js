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
        const items = this.options.properties;
        for (const key in items) {
            let prop = items[key];
            let cls = this.getClassByProperty(prop);
            if(!cls) {
                continue;
            }

            let property = document.createElement(cls.tag);
            //console.log('prop', property);
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
            this.element.wrapper.appendChild(property);
        }
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