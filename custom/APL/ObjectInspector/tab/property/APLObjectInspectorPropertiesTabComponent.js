class APLObjectInspectorPropertiesTabComponent extends BestAppsObjectInspectorPropertiesTabComponent {
    static tag = 'apl-object-inspector-properties-tab-component';

    getClassByProperty(property) {
        let cls = super.getClassByProperty(property);
        if (property.options?.visual === 'scale-picker') {
            cls = APLObjectInspectorPropertyScaleComponent;
        }
        return cls;
    }
}

customElements.define(APLObjectInspectorPropertiesTabComponent.tag, APLObjectInspectorPropertiesTabComponent);
