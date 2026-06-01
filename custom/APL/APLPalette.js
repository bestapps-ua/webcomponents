class APLPalette {

    /**
     * @property {BestAppsObjectPaletteComponent} palette
     */
    palette;

    /**
     * @property {HTMLElement} container
     */
    container;

    constructor(props = {}) {
        this.container = props.container;
        this.init();
        this.initComponents();
    }

    init() {
        this.palette = document.createElement(BestAppsObjectPaletteComponent.tag);
        this.container.appendChild(this.palette);
        return this.palette;
    }

    initComponents() {
        this.palette.subscribe(BestAppsComponent.EVENT_RENDERED, () => {
            for (const [schemaType, componentClass] of Object.entries(APLComponentRegistry)) {
                this.create(`APL${schemaType}`, componentClass.tag);
            }
        });
    }

    getPalette() {
        return this.palette;
    }

    create(type, tag) {
        let component = document.createElement(BestAppsComponent.tag);
        component.setAttribute('type', type);
        component.setAttribute('tag', tag);
        this.palette.addComponent(component);
        return component;
    }
}
