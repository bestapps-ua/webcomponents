/**
 *         //TODO: flex everywhere so no exact position everywhere?
 */
class APLFactory {
    /**
     * @property {BestAppsObjectPaletteComponent} palette
     */
    palette;

    /**
     * @property {APLScreen} screen
     */
    screen;

    items = [];

    /**
     * @property {BestAppsObjectInspectorComponent} inspector
     */
    inspector;

    /**
     * @property {APLDom} dom
     */
    dom;

    getItems() {
        return this.items;
    }

    addItem(component) {
        this.items.push(component);
    }

    setPalette(palette) {
        this.palette = palette;
    }

    getPalette() {
        return this.palette;
    }

    setInspector(inspector) {
        this.inspector = inspector;
    }

    getInspector() {
        return this.inspector;
    }

    setDom(dom) {
        this.dom = dom;
    }

    /**
     *
     * @returns {APLDom}
     */
    getDom() {
        return this.dom;
    }

    constructor(props) {
        this.setPalette(props.palette);
        this.setScreen(props.screen);
    }

    dropHandler(ev, component) {
        ev.preventDefault();
        const {dragId, dragType} = this.getEventComponentType(ev);
        if (component.constructor.name === 'APLDocumentComponent') {
            this.dropCopyHandler(ev, component, dragId, dragType);
        } else {
            console.log('move');
        }
    }

    /**
     * @param ev
     * @param container
     * @param dragId
     * @param dragType
     */
    async dropCopyHandler(ev, container, dragId, dragType) {
        let position = {
            x: ev.offsetX,
            y: ev.offsetY,
        }
        let component = this.getPalette().findByType(dragId);
        if (component) {
            let element = await this.copy(component, container);
        }
    }

    dragoverHandler(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "copy";
    }

    async dropAPLHandler(ev, el) {
        ev.preventDefault();
        ev.stopPropagation();
        const type = this.getEventComponentType(ev);

        if (type.dragType === 'Palette') {
            //from palette
            let component = this.getPalette().findByType(type.dragId);
            if (component) {
                let element = await this.copy(component, el);
            }
        } else if (type.dragType === 'APL') {
            //TODO: find in object inspector (???)
            //TODO: remove child
            //TODO: move to other component somehow
            let component = this.getInspector().findComponent(type.dragId);
            let toComponent = this.getInspector().findComponent(el.guid);
            component.setAPLParent(toComponent);
        } else {
            //from apl in document

        }
    }

    processElementAction(ev, el, callback) {
        if (['APLTouchWrapper', 'APLText', 'APLImage'].includes(el.getAPLType())) {
            ev.stopPropagation();
            callback();
        } else {
            let item = this.getDom().findByGuid(el.guid);
            let chains = this.getDom().getParentChain(item);
            if (chains) {
                let touch = this.getDom().findTouchWrappers(chains);
                if (touch.length === 0) {
                    ev.stopPropagation();
                    callback();
                }
            } else {
                callback();
            }
        }
    }

    dragStartHandler(ev, el) {
        this.processElementAction(ev, el, () => {
            ev.dataTransfer.setData("text/plain", this.generateElementId(el));
        });
    }

    /**
     * @param component
     * @param container
     * @returns {Node | ActiveX.IXMLDOMNode}
     */
    async copy(component, container) {
        let type = component.APLType || component.getAttribute('type');
        let tag = component.getAttribute('tag');
        return await this.copyFromTag(tag, type, container);
    }

    async copyFromTag(tag, type, container, data) {
        let el = document.createElement(tag);
        let lastNumber = this.getNextAPLNumber(type);
        let name = `${type}${lastNumber}`;
        el.setAPLType(type);
        el.setAPLName(name);
        el.setAPLParent(container);
        el.setAPLData(data || {});
        el.setAPLNumber(lastNumber);
        el.setAttribute('tag', tag);
        el.setFactory(this);

        if (container.getItems().length === 0) {
            container.element.wrapper.innerHTML = '';
        }
        container.element.wrapper.appendChild(el);
        container.addItem(el.guid);
        this.addItem(el);
        el.addEventListener("dragstart", (ev) => this.dragStartHandler(ev, el));
        el.addEventListener('drop', (ev) => this.dropAPLHandler(ev, el));
        el.addEventListener('dragover', (ev) => this.dragoverHandler(ev));
        el.addEventListener('click', (ev) => {
            this.processElementAction(ev, el, () => {
                this.onSelect(el);
            });
        });
        return new Promise((resolve, reject) => {
            el.subscribe(APLComponent.EVENT_RENDERED, () => {
                this.initComponent(el);
                resolve(el);
            });
        });
    }

    /**
     *
     * @param {APLComponent} component
     * @param {APLComponent} parent
     * @returns {Promise<APLComponent>}
     */
    async clone(component, parent) {
        return await this.copyFromTag(component.constructor.tag, component.getAPLType(), parent, component.getAPLData());
    }

    async cloneByDomItemsMove(remove, moveTo, level = 0, childsToDelete = [], options) {
        options = options || {sendEvent: true};
        let isOpen = this.inspector.objectsSelectorComponent.isOpen();
        let isSameLevel = window.aplDom.isOnSameLevel(remove.item, moveTo.item);
        let component;
        let index = -1;
        if (isSameLevel && level === 0) {
            component = await this.clone(remove.item.component, moveTo.item.parent.component);
            index = moveTo.item.index;
        } else {
            component = await this.clone(remove.item.component, moveTo.item.component);
        }

        if (isSameLevel && level === 0 && index !== -1) {
            //TODO: moveto - get parent!
            let moveTo2 = this.getDom().getComponentDataByItem(remove.item.parent);
            this.getDom().moveAPLDataToParent(moveTo2, remove, component, index);
        } else {
            this.getDom().moveAPLDataToParent(moveTo, remove, component);
        }

        childsToDelete.push(remove.item.component.guid);
        if (remove.item.items.length > 0) {
            for (const moveItem of remove.item.items) {
                await this.cloneByDomItemsMove(this.getDom().getComponentDataByItem(moveItem), this.getDom().getComponentData(component), level + 1, childsToDelete);
            }
        }
        if (level === 0) {
            if (options.sendEvent) {
                childsToDelete.reverse();
                this.removeMovedItemChildrens(childsToDelete);
                component.publish(APLComponent.EVENT_MOVED, {
                    isComponentSelectOpen: isOpen,
                });
            }
            this.getDom().getComponentDataByItem(moveTo.item.parent).aplData.item.items.splice(moveTo.item.index, 1);
        }

        return component;
    }


    removeMovedItemChildrens(childsToDelete) {
        for (const guid of childsToDelete) {
            let componentItem = this.getDom().findByGuid(guid);
            componentItem.parent.component.element.wrapper.removeChild(componentItem.component);
            this.getDom().removeByGuid(guid);
        }
    }

    initComponent(component) {
        let type = component.getAPLType();
        component.setAttribute('draggable', 'true');
        let data = component.getAPLData();
        if (type === 'APLImage') {
            const img = document.createElement('img');
            img.src = data.source;
            img.alt = '';
            component.element.wrapper.replaceChildren(img);
        } else if (type === 'APLText') {
            const div = document.createElement('div');
            div.textContent = data.text;
            component.element.wrapper.replaceChildren(div);
        } else {
            component.element.wrapper.textContent = component.getAPLName();
        }
        this.onSelect(component);
    }

    /**
     *
     * @property {APLComponent} className
     * @property {APLComponent} container
     * @returns {*}
     */
    create(className, container) {
        let component = document.createElement(className.tag);
        component.subscribe(APLComponent.EVENT_RENDERED, () => {
            component.element.wrapper.addEventListener('drop', (ev) => this.dropHandler(ev, component));
            component.element.wrapper.addEventListener('dragover', (ev) => this.dragoverHandler(ev));
        });
        container.appendChild(component);
        return component;
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

    generateElementId(element) {
        return 'APL::' + element.getAttribute('guid');
    }

    getItemByAPLName(APLName) {
        return this.getItems().find((item) => item.getAPLName() === APLName);
    }

    getItemByGuid(guid) {
        return this.getItems().find((item) => item.guid === guid);
    }

    getNextAPLNumber(APLType) {
        let lastNumber = 0;
        for (const item of this.getItems()) {
            if (item.getAPLType() === APLType && item.getAPLNumber() > lastNumber) {
                lastNumber = item.getAPLNumber();
            }
        }
        return lastNumber + 1;
    }

    onSelect(component) {
    }

    getScreen() {
        return this.screen;
    }

    setScreen(aplScreen) {
        this.screen = aplScreen;
    }

}