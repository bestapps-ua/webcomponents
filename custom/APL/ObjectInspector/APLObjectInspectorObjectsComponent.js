class APLObjectInspectorObjectsComponent extends BestAppsObjectInspectorObjectsComponent {
    static tag = 'apl-object-inspector-objects-component';

    /**
     * @property {HTMLElement} selectContainer
     */
    selectContainer;

    async initElements() {
        await super.initElements();
        window.addEventListener("mousedown", (event) => {

            if (!(event.target.closest('ba-object-inspector-component'))
            ) {
                this.onClose();
            }
        });
    }

    setComponents(components) {
        super.setComponents(components);
    }

    async initSelect(options = {}) {
        console.log('INIT SELECT');
        this.selectElement = document.createElement('div');
        this.selectElement.classList.add('select');
        this.selectElement.setAttribute('part', 'select');

        this.selectContainer = document.createElement('div');
        this.selectContainer.classList.add('select-container');
        this.selectContainer.setAttribute('part', 'select-container');

        const components = this.getComponents();
        for (const component of components) {
            this.addOption(component);
        }

        this.selectElement.addEventListener('click', () => {
            if (this.selectContainer.classList.contains('select-container--active')) {
                this.close();
            } else {
                this.open();
                let option = this.getOption(this.getOptionValue(this.component));
                option.scrollIntoView({behavior: "instant", block: "end"});
            }
        });
        if (options.refresh === true) {
            this.element.wrapper.insertBefore(this.selectElement, this.element.wrapper.firstChild);
            this.element.wrapper.insertBefore(this.selectContainer, this.selectElement);
            this.open();
        } else {
            this.element.wrapper.appendChild(this.selectElement);
            this.element.wrapper.appendChild(this.selectContainer);

        }

    }

    initTabs() {
        super.initTabs();
        this.tabsComponent.subscribe(BestAppsComponent.EVENT_CHANGED, async (data) => {
            if (data.data?.key === 'name' && data.data?.tabName === 'Properties') {
                const name = data.data.data.value;
                this.component.setAPLName(name);
                this.selectElement.innerHTML = this.getOptionName(this.component, name);
                let option = this.getOption(this.getOptionValue(this.component));
                const before = option.getAttribute('before');
                option.innerHTML = before + this.getOptionName(this.component, name);
            }
        });
    }

    addComponent(component) {

        super.addComponent(component);
        let name = localStorage.getItem(`${APLObjectInspectorObjectsComponent.tag}.${window.location.pathname}.component`);
        let currentComponent = this.findComponentByName(name);
        if (currentComponent) {
            this.sendChanged(BestAppsObjectInspectorObjectsComponent.EVENT_CHANGED_COMPONENT, {toComponent: currentComponent});
            this.selectComponent(currentComponent);
        }
    }

    addOption(component) {

        let option = document.createElement('div');
        option.setAttribute('value', this.getOptionValue(component));
        option.classList.add('select-option');
        option.innerHTML = this.getOptionName(component);
        //TODO: add div child elements - icon, title
        option.addEventListener('click', async () => {
            const component = this.findComponent(option.getAttribute('value'));
            if (this.component !== component) {
                await this.sendChanged(BestAppsObjectInspectorObjectsComponent.EVENT_CHANGED_COMPONENT, {toComponent: component});
                let name = component.getAttribute(this.options.nameAttribute);
                localStorage.setItem(`${APLObjectInspectorObjectsComponent.tag}.${window.location.pathname}.component`, name);
            }
            this.selectComponent(component);
        });

        this.selectContainer.appendChild(option);

        if (component.getAPLParent()) {
            this.normalizeOption(component);
        }

        component.subscribeOnce(APLComponent.EVENT_MOVED, async (data) => {
            if (component.moved) {
                return;
            }
            component.moved = true;
            let dom = window.apl.aplDom;
            let guid = this.getComponents()[0].guid;
            let items = dom.getChildrenFlatList(dom.findByGuid(guid));
            let mainComponent = this.getComponents()[0];
            this.setComponents([]);
            this.addComponent(mainComponent);
            for (const item of items) {
                this.addComponent(item.component);
            }

            await this.refreshSelect();
            let comp = dom.findByGuid(component.guid).component;
            window.aplFactory.onSelect(comp);
            items = dom.getChildrenFlatList(dom.findByGuid(comp.guid));
            for (const item of items) {
                window.apl.viewComponent(item.component);
            }
            setTimeout(() => {
                this.selectComponent(comp, {
                    close: !data.isComponentSelectOpen,
                    scroll: true,
                });

            }, 100);
        });

        this.setOptionDrag(option, component);
    }

    normalizeOption(component) {
        let count = this.getParentCount(component);
        let option = this.findOption(this.getOptionValue(component));
        option.style.marginLeft = `${count * 15}px`;
    }

    findOption(guid) {
        let children = this.selectContainer.children;
        for (const child of children) {
            if (child.getAttribute('value') === guid) {
                return child;
            }
        }
    }

    selectComponent(component, options) {
        options = options || {
            close: true,
        };
        super.selectComponent(component);
        this.selectElement.innerHTML = this.getOptionName(component);
        if (options.close) {
            this.close();
        } else {
            this.open();
        }
        if (options.scroll) {
            let option = this.findOption(component.guid);
            option.scrollIntoView({behavior: "instant", block: "end"});
        }
    }

    selectOption(uid) {
        let options = [].slice.call(this.selectContainer.getElementsByTagName('div'));
        for (const option of options) {
            option.classList.remove('selected');
        }
        let option = this.getOption(uid);
        if (option) {
            option.classList.add('selected');
        }
    }

    getOption(uid) {
        let options = [].slice.call(this.selectContainer.getElementsByTagName('div'));
        return options.find((option) => option.getAttribute('value') === uid);
    }

    getParentCount(component, count = 0) {
        if (component.getAPLParent()) {
            count++;
            return this.getParentCount(component.getAPLParent(), count);
        }
        return count;
    }

    getStyle() {
        return `
            .select {               
                height: 25px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                cursor: pointer;
            }
            
            
            .select-container {
                overflow: auto;
                height: 300px;
                width: 500px;
                position: absolute;
                background: white;
                z-index: 2;
                display: none;
                cursor: pointer;
            }
            
            .select-container--active {
                display: block;
            }
            
            .selected {
                border: red 1px solid !important;
            }
            
            .select-option {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                
                border: black 1px solid;
                width: auto;
                max-width: 200px;
                border-radius: 5px;
                margin: 5px;
                height: 25px;
                
                display: flex;
                flex-direction: column;
                align-items: start;
                justify-content: center;
            }
            
            .select-option:hover {
                background-color: cornflowerblue;
                color: white;
                font-weight: bold;
            }
        `;
    }

    getOptionName(component, name) {
        let data = component.getAPLData();
        name = name || data.id || component.getAttribute(this.options.nameAttribute);
        return `${name}: ${component.getAttribute(this.options.typeAttribute)}`;
    }

    findComponentIndex(guid) {
        let idx = 0;
        let found = false;
        for (const curComponent of this.components) {
            if (curComponent.guid === guid) {
                found = true;
                break;
            }
            idx++;
        }
        return !found ? -1 : idx;
    }

    getComponentItemsTotalCount(component, ignoreComponent) {
        let count = 0;
        let items = component.getItems();
        for (const guid of items) {
            if (ignoreComponent && guid === ignoreComponent.guid) {
                continue;
            }
            count++;
            let childComponent = this.findComponent(guid);
            if (childComponent && childComponent.getItems().length > 0) {
                count += this.getComponentItemsTotalCount(childComponent, ignoreComponent);
            }
        }
        return count;
    }

    getChildComponents(component) {
        let components = [];
        let items = component.getItems();
        for (const guid of items) {
            let childComponent = this.findComponent(guid);
            if (childComponent) {
                components.push(childComponent);
                if (childComponent.getItems().length > 0) {
                    let comps = this.getChildComponents(childComponent);
                    if (comps.length > 0) {
                        for (const comp of comps) {
                            components.push(comp);
                        }

                    }
                }
            }
        }
        return components;
    }

    async refreshSelect() {
        this.element.wrapper.removeChild(this.selectElement);
        this.element.wrapper.removeChild(this.selectContainer);
        await this.initSelect({refresh: true});
    }

    onClose() {
        this.close();
    }

    close() {
        this.selectContainer.classList.remove('select-container--active');
        this.opened = false;
    }

    open() {
        this.selectContainer.classList.add('select-container--active');
        this.opened = true;
    }

    setOptionDrag(option, component) {
        if (component.getAPLName() !== 'APLContainer1') {
            option.setAttribute('draggable', true)
            option.addEventListener("dragstart", (ev) => this.optionsDragStart(ev, option));
        }
        option.addEventListener('dragover', (ev) => this.optionsDragoverHandler(ev));
        option.addEventListener('drop', (ev) => this.optionDropHandler(ev, option));
    }

    optionsDragStart(ev, option) {
        ev.stopPropagation();
        ev.dataTransfer.setData("text/plain", this.generateOptionElementId(option));
    }

    optionsDragoverHandler(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "copy";
    }

    generateOptionElementId(option) {
        return 'OPTION::' + option.getAttribute('value');
    }

    async optionDropHandler(ev, option) {
        ev.preventDefault();
        ev.stopPropagation();
        const type = this.getEventComponentType(ev);

        console.log('DRAG END', 'FROM', type, 'TO', option.constructor.name, option.getAttribute('value'));

        if (type.dragType === 'OPTION') {
            let from = window.apl.aplDom.findByGuid(type.dragId);
            let to = window.apl.aplDom.findByGuid(option.getAttribute('value'));
            let mv = window.apl.aplDom.move(from, to);
            window.aplFactory.cloneByDomItemsMove(mv.remove, mv.moveTo);
        }
    }

    getEventComponentType(ev) {
        const data = ev.dataTransfer.getData("text/plain").split('::');
        const dragType = data[0];
        const dragId = data[1];
        return {
            dragType,
            dragId,
        }
    }


}

customElements.define(APLObjectInspectorObjectsComponent.tag, APLObjectInspectorObjectsComponent);