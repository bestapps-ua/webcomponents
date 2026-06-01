class APLObjectInspectorEventsTabComponent extends BestAppsObjectInspectorPropertiesTabComponent {
    static tag = 'apl-object-inspector-events-tab-component';
    getClassByProperty(property) {
        let cls = super.getClassByProperty(property);
        if (property.type === 'commands') {
            cls = APLObjectInspectorPropertyCommandComponent;
        }
        return cls;
    }

    onCommandOpen(property) {
        for (const prop of this.properties) {
            if(prop.name !== property.name) {
                prop.removeCommandContainer();
                prop.deactivate();
            }
        }
    }
}



customElements.define(APLObjectInspectorEventsTabComponent.tag, APLObjectInspectorEventsTabComponent);