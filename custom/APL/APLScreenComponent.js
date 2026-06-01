class APLScreenComponent extends BestAppsComponent {
    static tag = 'apl-screen-component';

    /**
     * @property {APLScreen} screen
     */
    screen;

    deviceContainer;
    resolutionContainer;

    /**
     * @property {HTMLSelectElement} deviceSelect
     */
    deviceSelect;

    /**
     * @property {HTMLSelectElement} resolutionSelect
     */
    resolutionSelect;

    setScreen(screen) {
        this.screen = screen;
    }

    getScreen() {
        return this.screen;
    }

    async initElements() {
        await super.initElements();
        this.deviceContainer = document.createElement('div');
        this.resolutionContainer = document.createElement('div');
        this.initDeviceSelect();
        this.initResolutionSelect();

    }

    async processOptions(options) {
        let opts = await super.processOptions(options);
        this.setScreen(opts.screen);
        this.screen.subscribe(APLScreen.EVENT_RESOLUTION_CHANGE, () => {
            this.onResolutionChange();
        });
        return opts;
    }

    getStyle() {
        return `
            :host {
                width: 100%;
                height: 100%;
            }
            .wrapper {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: row;
            }
        `;
    }

    initDeviceSelect() {
        this.deviceSelect = document.createElement('select');
        this.deviceSelect.setAttribute('part', 'device');
        let screens = APLScreen.getScreens();
        let keys = Object.keys(screens);
        for (const key of keys) {
            let screen = screens[key];
            this.addOption(this.deviceSelect, screen.name, screen.name, this.getScreen().getDevice().name);
        }
        this.deviceSelect.addEventListener('change', async (data) => {
            let item = Object.values(screens).find((item) => item.name === this.deviceSelect.value);
            this.getScreen().setDevice(item);
        });
        this.deviceContainer.appendChild(this.deviceSelect);
        this.element.wrapper.appendChild(this.deviceContainer);
    }

    initResolutionSelect() {
        this.resolutionSelect = document.createElement('select');
        this.resolutionSelect.setAttribute('part', 'resolution');
        let screen = this.getScreen().getDevice();
        for (const item of screen.items) {
            this.addOption(this.resolutionSelect, `${item.width}x${item.height}`, item.id, this.getScreen().getResolution().id);
        }
        this.resolutionSelect.addEventListener('change', async () => {
            let item = screen.items.find((item) => parseInt(item.id) === parseInt(this.resolutionSelect.value));
            this.getScreen().setResolution(item);
        });
        this.resolutionContainer.appendChild(this.resolutionSelect);
        this.element.wrapper.appendChild(this.resolutionContainer);
    }

    addOption(element, name, value, selected) {
        let option = document.createElement("option");
        option.value = value;
        option.innerHTML = `${name}`;
        if (selected === value) {
            option.selected = true;
        }
        element.appendChild(option);
    }

    onResolutionChange() {
        this.resolutionContainer.innerHTML = '';
        this.initResolutionSelect();
    }
}

customElements.define(APLScreenComponent.tag, APLScreenComponent);