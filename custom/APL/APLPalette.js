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
            this.createContainer();
            this.createEditText();
            this.createImage();
            this.createScrollView();
            this.createFrame();
            this.createText();
            this.createTouchWrapper();

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

    createContainer() {
        return this.create('APLContainer', APLContainerComponent.tag);
    }

    createEditText() {
        return this.create('APLEditText', APLEditTextComponent.tag);
    }

    createFrame() {
        return this.create('APLFrame', APLFrameComponent.tag);
    }

    createImage() {
        return this.create('APLImage', APLImageComponent.tag);
    }

    createScrollView() {
        return this.create('APLScrollView', APLScrollViewComponent.tag);
    }

    createText() {
        return this.create('APLText', APLTextComponent.tag);
    }

    createTouchWrapper() {
        return this.create('APLTouchWrapper', APLTouchWrapperComponent.tag);
    }
}