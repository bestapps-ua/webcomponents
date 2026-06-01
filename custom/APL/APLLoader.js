class APLLoader {
    data;
    scheme;
    /**
     * @property {BestAppsComponent} container
     */
    container;

    /**
     * @property {APLFactory} factory
     */
    factory;

    /**
     * @property {APLDom} dom
     */
    dom;

    constructor(props) {
        this.data = props;
        this.container = this.data.container;
        this.factory = this.data.factory;
        this.dom = this.data.dom;
    }

    setDom(aplDom) {
        this.dom = aplDom;
    }

    async load() {
        this.getLocalJSON(this.data.path);
    }

    /**
     * TODO: use data as
     */
    async createComponents(items, container) {
        for (const item of items) {
            let className;
            switch (item.type) {
                case "Container":
                    className = APLContainerComponent;
                    break;

                case "Frame":
                    className = APLFrameComponent;
                    break;

                case "Image":
                    className = APLImageComponent;
                    break;

                case "Text":
                    className = APLTextComponent;
                    break;

                case "TouchWrapper":
                    className = APLTouchWrapperComponent;
                    break;

                default:
                    console.warn('err createComponents', {type: item.type, item});
                    continue;
            }
            let component = await this.factory.copyFromTag(className.tag, `APL${item.type}`, container, item);

            component.setFactory(this.factory);

            if (container.getAPLType()) {
                component.setAPLParent(container);
            }

            let properties = component.getAPLProperties();
            let data = component.getAPLData();
            for (const key in properties) {
                APLProperties.encode(component, key, data[key] || properties[key]?.default);
            }

            this.dom.addByComponent(component, container);

            if (item.items) {
                await this.createComponents(item.items, component);
            }
            if (item.item) {
                await this.createComponents(item.item, component);
            }


        }
    }

    async getLocalJSON(jsonUrl) {
        let jsonScript = document.createElement('script');
        jsonScript.type = 'text/javascript';
        jsonScript.src = jsonUrl;
        jsonScript.id = `schema_${Date.now()}`;
        document.getElementsByTagName('head')[0].appendChild(jsonScript);

        return new Promise((resolve, reject) => {
            jsonScript.onload = async () => {
                this.scheme = scheme;
                this.dom.setAplDocument(this.scheme);
                await this.loadComponents();
                resolve();
            };
        });
    }

    async loadComponents() {
        await this.createComponents(this.scheme.document.mainTemplate.items, this.container);
    }

    getTabProperties(component) {
        return APLProperties.decodeByComponent(component);
    }

    getTabEvents(component) {
        return APLEvents.decode(component);
    }

    getTabData(component) {
        //console.log('apl', component.getAPLData());
        return component.getAPLData();
    }

    getTabs(component) {
        let tabs = [
            {
                name: 'Properties',
                class: BestAppsObjectInspectorPropertiesTabComponent,
                options: {
                    properties: this.getTabProperties(component),
                }
            },
            {
                name: 'Events',
                class: APLObjectInspectorEventsTabComponent,
                options: {
                    properties: this.getTabEvents(component),
                }
            },
            {
                name: 'Data',
                class: APLObjectInspectorDataTabComponent,
                options: {
                    properties: this.getTabData(component),
                }
            },
        ];
        return tabs;
    }

    async refresh() {
        this.container.innerHTML = '';
        await this.loadComponents();
    }

}