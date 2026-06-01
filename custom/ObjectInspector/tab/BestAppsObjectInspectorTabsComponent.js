class BestAppsObjectInspectorTabsComponent extends BestAppsComponent {
    static tag = 'ba-object-inspector-tabs-component';

    static EVENT_TAB_SELECTED = 'tab.selected';

    selectedTab;
    tabs = [];
    panels = [];

    setTabs(tabs) {
        this.tabs = tabs;
    }

    getTabs() {
        return this.tabs;
    }

    async initElements() {
        await super.initElements();
        this.initTabs();
        this.initPanelContainer();
        this.addCss(`
             .tab {
                width: ${100 / this.getTabs().length}%;
             }
        `);
    }

    initTabs() {
        this.tabsContainer = document.createElement('div');
        this.tabsContainer.classList.add('tabs');
        this.tabsContainer.setAttribute('part', 'container');
        this.addTabs();
        this.element.wrapper.appendChild(this.tabsContainer);
    }

    addTabs() {
        let tabs = this.getTabs();
        for (const tab of tabs) {
            tab.el = this.initTab(tab);
            this.tabsContainer.appendChild(tab.el);
        }
    }

    refreshTabs() {
        this.tabsContainer.innerHTML = '';
        this.addTabs();
    }

    initTab(tab) {
        let el = document.createElement('div');
        el.setAttribute('type', tab.name);
        el.classList.add('tab');
        el.setAttribute('part', 'tab');
        el.innerHTML = tab.name;
        el.addEventListener('click', () => {
            this.callWithEvent('processSelectTab', this.constructor.EVENT_TAB_SELECTED, {tab})
        });
        return el;
    }

    addPanels(){
        let tabs = this.getTabs();
        for (const tab of tabs) {
            let el = this.initPanel(tab);
            tab.panelEl = el;
            this.panelContainer.appendChild(el);
        }
    }

    initPanelContainer() {
        this.panelContainer = document.createElement('div');
        this.panelContainer.setAttribute('type', 'panel-container');
        this.panelContainer.classList.add('panel-container');
        this.addPanels();
        this.element.wrapper.appendChild(this.panelContainer);
    }

    refreshPanelContainer(){
        this.panelContainer.innerHTML = '';
        this.addPanels();
    }

    createPanel(type, tag, options) {
        let panel = document.createElement(tag);
        panel.setOptions(options);
        panel.setAttribute('type', type);
        panel.classList.add('panel');
        if (this.selectedTab === type) {
            panel.classList.add('panel--selected');
        }
        panel.setAttribute('part', 'panel');
        panel.innerHTML = type;
        panel.subscribe(BestAppsComponent.EVENT_CHANGED, (data) => {
            this.sendChanged(data.type, data.data);
        });
        this.panels.push(panel);
        return panel;
    }

    initPanel(tab) {
        return this.createPanel(tab.name, tab.class.tag, Object.assign({
            tabName: tab.name,
        }, tab.options));
    }

    getStyle() {
        return `
            .wrapper {
                display: flex;
                flex-direction: column;
                height: 100%;        
            }  
            
            .tabs {
                display: flex;
                flex-direction: row;  
                padding: 3px 3px 0px 0px;      
            } 
            
            .tab {
                margin: 3px 3px 0px 3px;
                padding: 3px;
                border-radius: 5px;
                border: 1px solid cornflowerblue;
                border-bottom-left-radius: unset;
                border-bottom-right-radius: unset;
                
                cursor: pointer;
            }
            
            .tab--selected {
                font-weight: bold;
                background-color: cornflowerblue;
                color: white;
                
            }
            
            .panel-container {
                flex-grow: 1;
                padding: 5px 3px;
                border: 1px solid cornflowerblue;
                background-color: cornflowerblue;
                max-width: 100%;
                overflow: auto;
            }
            
            .panel {
                width: 100%;
                display: none;
            }            
            
            .panel--selected {
                display: block;
            }
            
        `;
    }

    /**
     * @returns {Promise<void>}
     */
    async render() {
        let tabs = this.getTabs();
        for (const tab of tabs) {
            if (this.selectedTab === tab.el.getAttribute('type')) {
                tab.el.classList.add('tab--selected');
            } else {
                tab.el.classList.remove('tab--selected');
            }
        }

        for (const panel of this.panels) {
            if (this.selectedTab === panel.getAttribute('type')) {
                panel.classList.add('panel--selected');
                try {
                    panel.render();
                } catch (e) {

                }
            } else {
                panel.classList.remove('panel--selected');
            }
        }
    }

    async processOptions(options) {
        options = await super.processOptions(options);
        let tabs = options.tabs || [];
        this.setTabs(tabs);
        if(tabs.length > 0) {
            this.selectedTab = this.getTabs()[0].name;
        }
        return options;
    }

    async processSelectTab({tab}) {
        this.selectedTab = tab.name;
        await this.render();
    }

    async update({tabs}) {
        this.setTabs(tabs);
        let tab = this.findTab(this.selectedTab);
        if (!tab) {
            this.selectedTab = this.getTabs()[0].name;
        }
        this.refreshTabs();
        this.refreshPanelContainer();
        await this.render();
    }

    findTab(name) {
        return this.getTabs().find((tab) => tab.name === name);
    }

    async updateProperties(tab, properties) {
        let foundTab = this.findTab(tab.name);
        if(foundTab) {
            foundTab.panelEl.update(properties);
        }
    }
}

customElements.define(BestAppsObjectInspectorTabsComponent.tag, BestAppsObjectInspectorTabsComponent);