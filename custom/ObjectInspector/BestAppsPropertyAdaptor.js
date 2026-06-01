class BestAppsPropertyAdaptor {

    /**
     * @property {BestAppsComponent} _component
     */
    _component;

    /**
     * @property {BestAppsObjectInspectorComponent} _inspector
     */
    _inspector;

    /**
     * @property {Array<BestAppsObjectInspectorTabComponent>} _tabs
     */
    _tabs;

    constructor(props) {
        if(props.component) {
            this.setComponent(props.component);
        }
        this.setInspector(props.inspector);


    }

    /**
     * @property {BestAppsComponent} component
     * @param component
     */
    setComponent(component) {
        if (this._component !== component){
            setTimeout(() => {
                this.onComponentLoad(this.getComponent());
            }, 1);
        }
        this._component = component;

        return this.getComponent();
    }

    getComponent() {
        return this._component;
    }

    getTabs() {
        return this.getInspector().objectsSelectorComponent.tabsComponent.getTabs()
    }

    /**
     *
     * @param {BestAppsObjectInspectorComponent} inspector
     */
    setInspector(inspector) {
        this._inspector = inspector;
        if (this._inspector) {
            inspector.subscribe(BestAppsObjectInspectorComponent.EVENT_CHANGED, (data) => {
                this.onChange(data);
            });
        }
        return this.getInspector();
    }

    getInspector() {
        return this._inspector;
    }

    /**
     * Use this to get info what changed:
     * - BestAppsObjectInspectorObjectsComponent.EVENT_CHANGED_COMPONENT
     * - BestAppsObjectInspectorObjectsComponent.EVENT_CHANGED_TAB
     *
     * @param data
     */
    onChange(data) {
        let d = data.data;
        if (data.type === BestAppsObjectInspectorObjectsComponent.EVENT_CHANGED_TAB) {
            this.onTabChange({tabName: d.tabName, data: d.data, source: data});
        }
        if (data.type === BestAppsObjectInspectorObjectsComponent.EVENT_CHANGED_COMPONENT) {
            let component = d.toComponent;
            this.onComponentChange({component, source: data});
        }
    }

    /**
     *
     * @param component
     * @param source
     */
    onComponentChange({component, source}) {

    }

    /**
     *
     * @param tabName
     * @param data
     * @param source
     */
    onTabChange({tabName, data, source}) {

    }

    onComponentLoad(component) {

    }

    /**
     *
     * @param component
     * @param tabs
     */
    update(component, tabs) {
        this._inspector.update({component, tabs});
        this.setComponent(component);
    }

    /**
     *
     * @param  {Object} tab
     * @param properties
     */
    updateProperties(tab, properties) {
        this._inspector.sendComponentPropertiesChanged(tab, properties);
        for (const propertyName in properties) {
            let property = this._findProperty(tab.name, propertyName);
            if(!property) {
                continue;
            }
            this._syncProperty(this._findTab(tab.name), propertyName, properties[propertyName]);
        }
    }

    /**
     * TODO: states?
     * @param {Object} tab
     * @param {string} propertyName
     * @param {Object} data
     */
    updateProperty(tab, propertyName, data) {
        let property = this._findProperty(tab.name, propertyName);
        if (!property) {
            return undefined;
        }
        this._inspector.sendComponentPropertiesChanged(tab, {
            [propertyName]: data,
        });
        this._syncProperty(this._findTab(tab.name), propertyName, data);
    }

    _syncProperty(tab, propertyName, data) {
        tab.options.properties[propertyName] = data;
    }

    _findTab(tabName) {
        return this.getTabs().find(item => item.name === tabName);
    }

    _findProperty(tabName, propertyName) {
        let tab = this._findTab(tabName);
        return tab?.options?.properties[propertyName];
    }
}