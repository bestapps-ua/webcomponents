class BestAppsObjectPaletteComponent extends BestAppsComponent {

    static tag = 'ba-object-palette-component';

    /**
     * @property {Array<BestAppsComponent>} components
     */
    components = [];

    getComponents() {
        return this.components;
    }

    setComponents(components) {
        for (const component of components) {
            this.components.push(component);
        }
    }

    async processOptions(options) {
        options = await super.processOptions(options);
        this.setComponents(options.components);
        return options;
    }

    dragStartHandler(ev) {
        ev.dataTransfer.setData("text/plain", this.generateElementId(ev.target));
    }

    async initElements() {
        await super.initElements();
        let components = this.getComponents();
        for (const component of components) {
            this.initComponent(component);
        }
    }

    getStyle() {
        return `
            .wrapper {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                .ba-component {
                    width: 95%;
                    margin: 10px;
                    border: 1px black solid;
                    padding: 10px;
                    overflow: hidden;
                    
                }
                .ba-component::part(wrapper) {
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                }
                
            }
        `;
    }

    /**
     *
     * @param {string} type
     */
    findByType(type) {
        return this.getComponents().find(component => component.getAttribute('type') === type);
    }

    generateElementId(element) {
        return 'Palette::' + element.getAttribute('type');
    }

    addComponent(component) {
        this.components.push(component);
        this.initComponent(component);
    }

    initComponent(component) {
        //TODO: looks like its APL
        component.style.backgroundColor = 'white';
        component.setAttribute('draggable', true);
        component.addEventListener("dragstart", (ev) => this.dragStartHandler(ev));
        this.element.wrapper.appendChild(component);
        component.subscribe(BestAppsComponent.EVENT_RENDERED, () => {
            component.element.wrapper.innerHTML = component.getAttribute('type');
        });
    }
}

customElements.define(BestAppsObjectPaletteComponent.tag, BestAppsObjectPaletteComponent);