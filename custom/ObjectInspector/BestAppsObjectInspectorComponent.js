/**
 * TODO: unsubscribe
 * TODO: send element event with prefix ba- like ba-change
 * TODO: make all on classes with --variables
 * TODO: apply element properties?
 */
class BestAppsObjectInspectorComponents extends BestAppsComponent {

    component;
    components = [];

    constructor(props) {
        props = props || {};

        props.options = {
            nameAttribute: 'name',
            typeAttribute: 'type',
            uidAttribute: 'guid',
        }
        super(props);
    }

    getComponent() {
        return this.component;
    }

    setComponent(component) {
        this.component = component;
    }

    async updateComponent(component) {
        let found = this.findComponent(this.getComponentUid(component));
        if (!found) {
            this.addComponent(component);
        }
        this.setComponent(component);
    }

    getComponents() {
        return this.components;
    }

    setComponents(components) {
        this.components = components;
    }

    addComponent(component) {
        this.components.push(component);
    }

    findComponent(uid) {
        return this.components.find((component) => this.getComponentUid(component) === uid);
    }

    findComponentByName(name) {
        return this.components.find((component) => component.getAttribute(this.options.nameAttribute) === name);
    }

    getComponentUid(component) {
        return component.getAttribute([this.options.uidAttribute]);
    }

    async processOptions(options) {
        options = await super.processOptions(options);
        this.setComponent(options.component);
        this.setComponents(options.components || []);
        return options;
    }

    clearComponents() {
        this.components.splice(0);
    }
}

class BestAppsObjectInspectorComponent extends BestAppsObjectInspectorComponents {
    static observedAttributes = [...this.defaultObservedAttributes];

    static tag = 'ba-object-inspector-component';

    static EVENT_COMPONENT_PROPERTIES_CHANGED = 'component.properties.changed';

    // selecting available components
    /**
     * @property {BestAppsObjectInspectorObjectsComponent} objectsSelectorComponent
     */
    objectsSelectorComponent;

    async initElements() {
        await super.initElements();
        let selectorClass = this.options.objectsSelector || BestAppsObjectInspectorObjectsComponent;
        this.objectsSelectorComponent = document.createElement(selectorClass.tag);
        await this.objectsSelectorComponent.setOptions(this.getOptions());
        await this.objectsSelectorComponent.subscribe(BestAppsComponent.EVENT_CHANGED, async (data) => {
            await this.sendChanged(data.type, Object.assign({component: this.getComponent()}, data.data));
        });
        this.element.wrapper.appendChild(this.objectsSelectorComponent);
    }

    getStyle() {
        return `
            .wrapper {
                width: 100%;
                height: 100%;
                --ba-obji-select-container-width: 100%;
                --ba-obji-select-container-height: 30px;
                display: block;
            }
        `;
    }

    getTabs() {
        return this.objectsSelectorComponent?.tabsComponent?.getTabs() || [];
    }

    async update({component, tabs}) {
        await this.updateComponent(component);
        await this.objectsSelectorComponent.update({component, tabs});
    }

    sendComponentPropertiesChanged(tab, properties) {
        this.callWithEvent('componentPropertiesChanged', this.constructor.EVENT_COMPONENT_PROPERTIES_CHANGED, {
            tab,
            properties
        });
    }

    async componentPropertiesChanged({tab, properties}) {
        await this.objectsSelectorComponent.updateProperties(tab, properties);
    }

    setComponent(component) {
        super.setComponent(component);

        let components = this.getComponents();
        for (const currentComponent of components) {
            if(currentComponent.guid === component.guid) {
                currentComponent.classList.add('selected');
            }else if(currentComponent.classList.contains('selected')) {
                currentComponent.classList.remove('selected');
            }
        }
    }
}

customElements.define(BestAppsObjectInspectorComponent.tag, BestAppsObjectInspectorComponent);