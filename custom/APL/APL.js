class APL {
    /**
     * @property {Array<Object>} vendors
     */
    vendors;

    /**
     * @property {BestAppsPropertyAdaptor} propertyAdaptor
     */
    propertyAdaptor;

    constructor(props) {
        this.vendors = props.vendors || [];

        this.pubsub = new BestAppsPublishSubscribe();

        window.apl = this;

        this.pubsub.subscribe(APLComponent.EVENT_PARENT_CHANGED, (data) => {
            console.log('GLOBAL REFRESH', data);
            console.log('APLDOM', this.aplDom);
            let res = this.aplDom.move(data.component, this.aplDom.findByGuid(data.parent));
            console.log('HOWTO', res);
            window.aplFactory.cloneByDomItemsMove(res.remove, res.moveTo);
        });

        Promise.all(this.initVendors()).then(async () => {
            console.log('init');
            await this.init();
        }).catch((err) => {
            console.log('err APL', err);
        });
    }

    async init() {
        const screens = APLScreen.getScreens();

        let container = document.getElementById('document');

        let aplScreen = new APLScreen({
            container,
            device: screens.echoShow2,
        });

        let screenComponent = document.createElement(APLScreenComponent.tag);
        screenComponent.setOptions({
            screen: aplScreen,
        });
        document.getElementById('screen').appendChild(screenComponent);

        let aplPalette = new APLPalette({
            container: document.getElementById('palette'),
        });

        let aplFactory = new APLFactory({
            palette: aplPalette.getPalette(),
            screen: aplScreen,
        });

        window.aplFactory = aplFactory;

        aplScreen.subscribe(APLScreen.EVENT_RESOLUTION_CHANGE, ({old, current}) => {
            let w = container.clientWidth;
            let diff = current.width / old.width;
            container.style.width = `${w * diff}px`;
            aplScreen.resizeHeight();
            for (const component of aplFactory.items) {
                let properties = component.getAPLProperties();
                let data = component.getAPLData();
                for (const key in properties) {
                    APLProperties.encode(component, key, data[key] || properties[key]?.value || properties[key]?.default);
                }
            }

        });

        let aplDocument = aplFactory.create(APLDocumentComponent, container);

        let aplLoader = new APLLoader({
            path: './custom/APL/Schemas/home.js',
            factory: aplFactory,
            container: aplDocument,
        });

        let aplDom = new APLDom({
            aplDocument,
        });

        aplLoader.setDom(aplDom);

        this.aplDom = aplDom;
        window.aplDom = aplDom;

        aplFactory.setDom(aplDom);

        this.aplLoader = aplLoader;

        let inspector = document.createElement(BestAppsObjectInspectorComponent.tag);

        this.inspector = inspector;

        aplFactory.setInspector(inspector);

        document.getElementById('inspector').appendChild(inspector);

        inspector.setOptions({
            nameAttribute: 'apl-name',
            typeAttribute: 'apl-type',
            objectsSelector: APLObjectInspectorObjectsComponent,
        });

        let propertyAdaptor = new BestAppsPropertyAdaptor({
            inspector,
        });

        propertyAdaptor.onComponentChange = ({component, source}) => {
            const tabs = aplLoader.getTabs(component);
            propertyAdaptor.update(component, tabs);
            inspector.update({component, tabs});
        }

        this.propertyAdaptor = propertyAdaptor;

        propertyAdaptor.onTabChange = ({tabName, data, source}) => {
            let component = propertyAdaptor.getComponent();
            let aplData = component.getAPLData();
            if (tabName === 'Properties') {
                APLProperties.encode(component, source.data.key, data?.value);
                this.updateTabs({[source.data.key]: data?.value});
            } else if (tabName === 'Events') {
                let key = source.data.key;
                let command;
                let commandCurrent;
                let d;
                let nAplData;
                switch (source.data.type) {
                    case APLObjectInspectorPropertyCommandComponent.EVENT_COMMAND_EVENT_REMOVED:
                        command = source.data.data.command;

                        d = aplData[key];
                        let idx = -1;
                        for (let i = 0; i < d.length; i++) {
                            if (d[i].uid === command.props.uid) {
                                idx = i;
                                break;
                            }
                        }
                        if (idx !== -1) {
                            d.splice(idx, 1);
                        }
                        break;

                    case APLObjectInspectorPropertyCommandComponent.EVENT_COMMAND_EVENT_ADDED:
                        command = source.data.data.command;
                        commandCurrent = source.data.data.commandCurrent;
                        d = aplData[key];
                        nAplData = commandCurrent.getAPLData();
                        nAplData.uid = command.uid;
                        if (!d) {
                            aplData[key] = [];
                            d = aplData[key];
                        }
                        d.push(nAplData);
                        break;

                    case APLObjectInspectorPropertyCommandComponent.EVENT_COMMAND_EVENT_SAVED:
                        command = source.data.data.command;
                        commandCurrent = source.data.data.commandCurrent;
                        d = aplData[key];
                        if (!d) {
                            aplData[key] = [];
                            d = aplData[key];
                        }
                        nAplData = commandCurrent.getAPLData();
                        nAplData.uid = command.uid;
                        for (let i = 0; i < d.length; i++) {
                            if (d[i].uid === command.props.uid) {
                                d[i] = nAplData;
                                break;
                            }
                        }

                        break;
                }
                console.log('.>>>>', key, d);
                this.updateTabs({[key]: d});
            } else if (tabName === 'Data') {
                switch (source.data.type) {
                    case APLObjectInspectorDataTabComponent.EVENT_TAB_JSON_CHANGED:
                        let json = source.data.data.json;
                        this.updateTabs(json);
                        break;
                }
            }

        }

        propertyAdaptor.onComponentLoad = (component) => {
            this.viewComponent(component);
        }

        aplFactory.onSelect = (component) => {
            propertyAdaptor.update(component, aplLoader.getTabs(component));
        }

        await aplLoader.load();
    }

    /**
     * Using to show visually correct component in APL area
     * @param component
     */
    viewComponent(component) {
        let properties = component.getAPLProperties();
        let data = component.getAPLData();
        for (const key in properties) {
            APLProperties.encode(component, key, data[key] || properties[key]?.value || properties[key]?.default);
        }
    }

    initVendors() {
        let p = [];
        for (const vendor of this.vendors) {
            p.push(this.initVendor(vendor));
        }
        return p;
    }

    initVendor(data) {
        let p = [];
        p.push(new Promise((resolve) => {
            let jsonScript = document.createElement('script');
            jsonScript.type = 'text/javascript';
            jsonScript.src = data.js;
            jsonScript.id = `vendor_${data.name.replace(/\s+/g, '_')}`;
            document.getElementsByTagName('head')[0].appendChild(jsonScript);
            jsonScript.onload = async () => {
                resolve();
            };
        }));
        if (data.css) {
            p.push(new Promise((resolve) => {
                let link = document.createElement('link');
                link.type = 'text/css';
                link.rel = 'stylesheet';
                link.href = data.css;
                link.id = 'css';
                link.media = 'all';
                document.getElementsByTagName('head')[0].appendChild(link);
                link.onload = async () => {
                    resolve();
                };
            }));
        }
        return Promise.all(p);
    }

    updateTabs(data) {
        let tabs = this.propertyAdaptor.getTabs();
        for (const tab of tabs) {
            tab.panelEl.update(data);
        }
    }

    publish(action, data) {
        this.pubsub.publish(action, data);
    }
}