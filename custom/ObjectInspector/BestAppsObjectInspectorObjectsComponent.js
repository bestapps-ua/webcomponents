class BestAppsObjectInspectorObjectsComponent extends BestAppsObjectInspectorComponents {
    static tag = 'ba-object-inspector-objects-component';

    static observedAttributes = [...this.defaultObservedAttributes, 'component'];

    static EVENT_CHANGED_COMPONENT = 'changed.component';
    static EVENT_CHANGED_TAB = 'changed.tab';

    selectElement;

    tabsComponent;

    eventList = [];
    isProcessing = false;
    opened = false;

    async initElements() {
        await super.initElements();
        await this.initSelect();
        this.initTabs();
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                this.onClose();
            }
        });
    }

    async initSelect() {
        this.selectElement = document.createElement('select');
        this.selectElement.setAttribute('part', 'select');
        const components = this.getComponents();
        for (const component of components) {
            this.addOption(component);
        }
        this.selectElement.addEventListener('change', async (data) => {
            const component = this.findComponent(this.selectElement.value);
            if (this.component !== component) {
                await this.sendChanged(this.constructor.EVENT_CHANGED_COMPONENT, {toComponent: component});
            }
            this.component = component;
        });
        this.element.wrapper.appendChild(this.selectElement);
    }

    initTabs() {
        this.tabsComponent = document.createElement(BestAppsObjectInspectorTabsComponent.tag);
        this.tabsComponent.classList.add('tabs');
        this.tabsComponent.setOptions({
            tabs: this.getOptions().tabs,
        });
        this.tabsComponent.setAttribute('part', 'tabs');
        this.tabsComponent.subscribe(BestAppsComponent.EVENT_CHANGED, async (data) => {
            await this.sendChanged(this.constructor.EVENT_CHANGED_TAB, data.data);
        });
        this.element.wrapper.appendChild(this.tabsComponent);
    }

    getStyle() {
        return `
            .wrapper {                
                display: flex;
                flex-direction: column; 
                justify-contents: space-between;
                height: 100%;
                
            }
            
            select {
                width: var(--ba-obji-select-container-width);
                height: var(--ba-obji-select-container-height);                
            }
            
            .tabs {
                    width: 100%;
                    //align-self: stretch;
                    //background-color: red;
                    min-height: calc(100% - var(--ba-obji-select-container-height)) !important;
                    //min-height: 100% !important;
                }
        `;
    }

    selectComponent(component) {
        const uid = this.getComponentUid(component);
        this.selectOption(uid);
    }

    selectOption(uid){
        let options = [].slice.call(this.selectElement.getElementsByTagName('option'));
        let option = options.find((option) => option.value === uid);
        if (option) {
            option.selected = 'selected'
        }
    }

    async update({component, tabs}) {

        await this.addEvent(async () => {
            await this.updateComponent(component);
            await this.updateTabs(tabs);
            await this.refresh();
        });
    }

    async updateComponent(component) {
        await super.updateComponent(component);
        this.selectComponent(component);
    }

    async updateTabs(tabs) {
        await this.tabsComponent.update({tabs});
    }

    async updateProperties(tab, properties) {
        await this.tabsComponent.updateProperties(tab, properties);
    }

    addComponent(component) {
        super.addComponent(component);
        this.addOption(component);
    }

    addOption(component) {
        let option = document.createElement("option");
        option.value = this.getOptionValue(component);
        option.innerHTML = this.getOptionName(component);
        this.selectElement.appendChild(option);
    }

    getOptionValue(component) {
        return component.getAttribute(this.options.uidAttribute);
    }

    getOptionName(component) {
        let name = component.getAttribute(this.options.nameAttribute);
        return `${name}: ${component.getAttribute(this.options.typeAttribute)}`;
    }

    async addEvent(callback) {
        this.eventList.push(callback);
        await this.processEvents();
    }

    async processEvents() {
        if (this.isProcessing) {
            return false;
        }

        this.isProcessing = true;
        let len = this.eventList.length;

        if (len === 0) {
            this.isProcessing = false;
            return false;
        }

        for (let i = 0; i < len; i++) {
            for (const callback of this.eventList) {
                callback();
            }
        }

        this.eventList.splice(0, len);

        this.isProcessing = false;
        setTimeout(async () => {
            await this.processEvents();
        }, 100);
    }

    onClose() {
        console.log('CLOSE');
    }

    isOpen() {
        return this.opened;
    }
}

customElements.define(BestAppsObjectInspectorObjectsComponent.tag, BestAppsObjectInspectorObjectsComponent);