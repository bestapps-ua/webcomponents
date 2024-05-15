/**
 *  Attributes:
 *  - debug - is set any value - will show debug info for that Component
 *
 *  Properties:
 *  - defaultOptions - set default for that Component
 *
 *  Settings:
 *  - defaultObservedAttributes - observable attributes list, by default - debug
 *  - tag - default tag of that Component to render, please use for define also
 *  - rootClass - internal, using to identify that its belongs by class to BestAppComponent
 *  - EVENT_* - list of events, which you can subscribe
 */
class BestAppsComponent extends HTMLElement {
    static defaultObservedAttributes = ['debug'];
    static observedAttributes = [...this.defaultObservedAttributes];

    // basic selector
    static rootClass = 'ba-component';
    static tag = 'ba-component';

    static EVENT_CHANGED = 'changed';
    static EVENT_ATTRIBUTE_CHANGED = 'attribute.changed';
    static EVENT_CLONED = 'cloned';
    static EVENT_CONNECTING = 'connecting';
    static EVENT_CONNECTED = 'connected';
    static EVENT_RENDERED = 'rendered';
    static EVENT_DISCONNECTED = 'disconnected';
    static EVENT_ADOPTED = 'adopted';
    static EVENT_PROPS_SET = 'props.set';
    static EVENT_ELEMENTS_SET = 'elements.set';
    static EVENT_ERROR = 'error';

    constructor() {
        super();

        this.defaultOptions = {
            debug: false,
        };

        this._data = {
            options: Object.create(this.defaultOptions),
            subscriptions: new Map(),
        };

        this.component = {
            shadow: undefined,
            style: undefined,
            wrapper: undefined,
        }

        this.guid = this.generateUid();

        this.initSubscriptions();
    }

    initSubscriptions() {
        this.subscribe(this.constructor.EVENT_CONNECTING, async () => {
            await this.processConnecting();
        });

        this.subscribe(this.constructor.EVENT_CONNECTED, async () => {
            await this.checkClone();
            await this.processConnected();
        });
    }

    async callWithEvent(method, event, data) {
        try {
            let d = await this[method](data) || (data || {});
            d._source = data;
            this._sendSubscriptionEvent(event, d);
            return d;
        } catch (err) {
            this.warning('callWithEvent', err, {method, event, data});
            throw err;
        }
    }

    /**
     * System
     * Use instead:
     * - initProps
     * - initElements
     * - render
     * - initConnected
     */
    connectedCallback() {
        this._sendSubscriptionEvent(this.constructor.EVENT_CONNECTING, this);
        new Promise(async (resolve, reject) => {
            await this.callWithEvent('initProps', this.constructor.EVENT_PROPS_SET);
            await this.callWithEvent('initElements', this.constructor.EVENT_ELEMENTS_SET);
            await this.callWithEvent('render', this.constructor.EVENT_RENDERED);
            resolve();
        }).then(async () => {
            await this.callWithEvent('initConnected', this.constructor.EVENT_CONNECTED);
        }).catch((err) => {
            this.warning('connectedCallback', err);
        });
    }

    /**
     * System
     * Use processDisconnected instead
     */
    disconnectedCallback() {
        this.callWithEvent('processDisconnected', this.constructor.EVENT_DISCONNECTED);
    }

    /**
     * System
     * Use processAdopted instead
     */
    adoptedCallback() {
        this.callWithEvent('processAdopted', this.constructor.EVENT_ADOPTED);
    }

    /**
     * System
     * Use processAttributeChanged instead
     */
    attributeChangedCallback(name, oldValue, newValue) {
        this.callWithEvent('processAttributeChanged', this.constructor.EVENT_ATTRIBUTE_CHANGED, {
            name,
            oldValue,
            newValue
        });
    }

    generateUid() {
        const MASK = 0x3d
        const LETTERS = 'abcdefghijklmnopqrstuvwxyz'
        const NUMBERS = '1234567890'
        const charset = `${NUMBERS}${LETTERS}${LETTERS.toUpperCase()}`.split('')

        const bytes = new Uint8Array(12);
        crypto.getRandomValues(bytes)
        return bytes.reduce((acc, byte) => `${acc}${charset[byte & MASK]}`, '');
    }

    async initElements() {
        this.classList.add(this.constructor.rootClass);
        this.component.shadow = this.attachShadow({mode: "open"});
        this.component.style = document.createElement("style");
        this.component.wrapper = document.createElement("div");
        this.component.wrapper.setAttribute("class", "wrapper");
        this.component.style.textContent = this.getStyle();
        this.component.shadow.appendChild(this.component.style);
        this.component.shadow.appendChild(this.component.wrapper);
        this.component.data = this.getData();
        let guid = this.getAttribute('guid');
        if (!guid) {
            this.setAttribute('guid', this.guid);
        }
    }

    async checkClone() {
        let guid = this.getAttribute('guid');
        if (!guid) {
            return;
        }
        let selector = `.${this.constructor.rootClass}[guid="${guid}"]`;
        let el = document.querySelector(selector);
        if (el && this.guid !== guid) {
            this.setAttribute('cloned-guid', guid);
            this.clonedGuid = guid;
            this.setAttribute('guid', this.guid);
            await this.callWithEvent('clonedCallback', this.constructor.EVENT_CLONED, el);
        }
    }

    async initProps() {

    }

    async render() {

    }

    getStyle() {
        return '';
    }

    async initConnected() {
        this.setAttribute('loaded', `loaded`);
        this.loaded = true;
        return this;
    }

    _getSubscriptions(action) {
        return this.getData().subscriptions.get(action) || [];
    }

    subscribe(action, callback) {
        let subs = this._getSubscriptions(action);
        subs.push(callback);
        this.getData().subscriptions.set(action, subs);
    }

    /**
     * Please use only in callWithEvent
     * @param action
     * @param data
     * @private
     */
    _sendSubscriptionEvent(action, data) {
        let options = this.getOptions();
        if (options.debug) {
            console.log('EVENT:',
                {
                    component: {
                        name: this.constructor.name,
                        guid: this.guid,
                        clonedGuid: this.clonedGuid
                    },
                    action,
                    data
                }
            );
        }

        let subs = this._getSubscriptions(action);
        for (const sub of subs) {
            sub(data);
        }
    }

    /**
     * Use this for global change of component
     * @param type: string,
     * @param data
     * @returns {Promise<void>}
     */
    async processChanged({type, data}) {
        //console.log('CHANGED', type, data);
    }

    getData() {
        return this._data;
    }

    setData(data) {
        this._data = data;
    }

    static getTags() {
        return {
            main: this.getTag(),
        };
    }

    static getTag() {
        return this.tag;
    }

    async setOptions(options) {
        options = Object.assign(await this.getOptions(), options);
        this._data.options = options;
    }

    getOptions() {
        return this._data.options;
    }

    async setOption(key, value) {
        let options = this.getOptions();
        options[key] = value;
    }

    async clonedCallback(fromElement) {
        this.setData(fromElement.getData());
        return fromElement;
    }

    warning(action, error, data) {
        console.warn(action, {data, error, component: this.constructor.name, guid: this.guid});
        this._sendSubscriptionEvent(this.constructor.EVENT_ERROR, {action, error, data});
    }

    async processDisconnected() {

    }

    async processAdopted() {

    }

    async processAttributeChanged({name, oldValue, newValue}) {
        if (name === 'debug' && newValue) {
            await this.setOption('debug', true);
        }

        setTimeout(async () => {
            await this.callWithEvent('processChanged', this.constructor.EVENT_CHANGED, {
                type: 'attribute',
                data: {name, oldValue, newValue}
            });
        }, 1);
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets
     * @param css
     */
    addCss(css){
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.component.shadow.adoptedStyleSheets = [...this.component.shadow.adoptedStyleSheets, sheet];
    }

    async processConnecting() {

    }

    async processConnected() {

    }
}
