/**
 *  Attributes:
 *  - debug - is set any value - will show debug info for that Component
 *
 *
 *  Settings:
 *  - defaultObservedAttributes - observable attributes list, by default - debug
 *  - tag - default tag of that Component to render, please use for define also
 *  - rootClass - internal, using to identify that its belongs by class to BestAppComponent
 *  - EVENT_* - list of events, which you can subscribe
 */

class BestAppsDeferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject
            this.resolve = resolve
        })
    }
}

class BestAppsPublishSubscribe {
    constructor() {
        this.events = {}
    }

    subscribe(event, handler, options = {}) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push({handler, options})
    }

    subscribeOnce(event, handler) {
        this.subscribe(event, handler, {once: true});
    }

    unsubscribe(event, handler) {
        if (this.events[event]) {
            const index = this.events[event].findIndex(item => item.handler === handler);
            this.events[event].splice(index, 1);
        }
    }

    publish(event, data) {

        if (!this.events[event]) {
            return false;
        }
        let toRemove = [];
        let i = 0;
        for (const item of this.events[event]) {
            item.handler(data);
            if (item.options.once === true) {
                toRemove.push(i);
            }
            i++;
        }
        for (let i = toRemove.length - 1; i >= 0; i--) {
            this.events[event].splice(toRemove[i], 1);
        }
        return true;
    }

}

class BestAppsComponent extends HTMLElement {
    static defaultObservedAttributes = ['debug'];
    static observedAttributes = [...this.defaultObservedAttributes];

    // basic selector
    static rootClass = 'ba-component';
    static tag = 'ba-component';


    /**
     * @property {BestAppsDeferred} loadedDefer
     */
    loadedDefer;

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
    static EVENT_OPTIONS_SET = 'options.set';
    static EVENT_ERROR = 'error';
    static EVENT_UPDATE = 'update';


    constructor(props) {
        props = props || {};
        super();

        this.loadedDefer = new BestAppsDeferred();
        this.pubsub = new BestAppsPublishSubscribe();

        this.defaultOptions = {
            debug: false,
        }

        let options = (props && props.options) || {};

        this.initData(options);

        this.element = {
            shadow: undefined,
            style: undefined,
            wrapper: undefined,
        }

        this.guid = this.generateUid();

        this.initSubscriptions();
    }

    initData(options) {
        this._data = {
            options: Object.assign({}, this.getDefaultOptions(), options),
            subscriptions: new Map(),
        };
        return this._data;
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
            this.publish(event, d);
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
        this.publish(this.constructor.EVENT_CONNECTING, this);
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
        this.element.shadow = this.attachShadow({mode: "open"});
        this.element.style = document.createElement("style");
        this.element.wrapper = document.createElement("div");
        this.element.wrapper.setAttribute("class", "wrapper");
        this.element.wrapper.setAttribute("part", "wrapper");
        this.element.style.textContent = this.getStyle();
        this.element.shadow.appendChild(this.element.style);
        this.element.shadow.appendChild(this.element.wrapper);
        this.element.data = this.getData();
        let guid = this.getAttribute('guid');

        if (!guid) {
            this.setAttribute('guid', this.guid);
        }

        this.addEventListener(this.getEventListenerName(this.constructor.EVENT_UPDATE), (data) => {
            this.update(data);
        });
    }

    async checkClone() {

        const querySelectorAll = (node, selector) => {
            const nodes = [...node.querySelectorAll(selector)],
                nodeIterator = document.createNodeIterator(node, Node.ELEMENT_NODE);
            let currentNode;
            while (currentNode = nodeIterator.nextNode()) {
                if (currentNode.shadowRoot) {
                    nodes.push(...querySelectorAll(currentNode.shadowRoot, selector));
                }
            }
            return nodes;
        }

        let guid = this.getAttribute('guid');
        if (!guid) {
            console.log('cur', this);
            return;
        }
        let selector = `.${this.constructor.rootClass}[guid="${guid}"]`;
        //let el = document.querySelector(selector);
        let el = querySelectorAll(document, selector);

        if (el.length > 0 && this.guid !== guid) {
            console.log('CLONED', el, this.guid !== guid);
            this.setAttribute('cloned-guid', guid);
            this.clonedGuid = guid;
            this.setAttribute('guid', this.guid);
            await this.callWithEvent('clonedCallback', this.constructor.EVENT_CLONED, el[0]);
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
        this.loadedDefer.resolve(true);
        return this;
    }

    subscribe(action, callback) {
        this.pubsub.subscribe(action, callback);
    }

    subscribeOnce(action, callback) {
        this.pubsub.subscribeOnce(action, callback);
    }

    unsubscribe(action, callback) {
        this.pubsub.unsubscribe(action, callback);
    }

    /**
     * Please use only in callWithEvent
     * @param action
     * @param data
     */
    publish(action, data) {
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

        this.pubsub.publish(action, data);
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

    setData(data, key) {
        let d = this.getData()
        if (key) {
            d[key] = data;
            return d;
        }
        this._data = data;
        return this.getData();
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
        options = Object.assign({}, this.getOptions(), options);
        this._data.options = options;
        await this.callWithEvent('processOptions', this.constructor.EVENT_OPTIONS_SET, options);
    }

    get options() {
        return this.getOptions();
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
        this.publish(this.constructor.EVENT_ERROR, {action, error, data});
    }

    async processDisconnected() {

    }

    async processAdopted() {

    }

    async processAttributeChanged({name, oldValue, newValue}) {
        if (name === 'debug' && newValue) {
            await this.setOption('debug', true);
        }
        await this.sendChanged('attribute', {name, oldValue, newValue});
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets
     * @param css
     */
    addCss(css) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.element.shadow.adoptedStyleSheets = [...this.element.shadow.adoptedStyleSheets, sheet];
    }

    async processConnecting() {

    }

    async processConnected() {
    }

    async processOptions(options) {
        return options;
    }

    static getEvents() {
        let events = [];
        for (let key in this) {
            if (key.indexOf('EVENT_') === 0) {
                events.push({[key]: this[key]});
            }
        }
        return events;
    }

    async sendChanged(type, data) {
        await this.callWithEvent('processChanged', this.constructor.EVENT_CHANGED, {
            type,
            data,
        });
    }

    getDefaultOptions() {
        return this.defaultOptions;
    }

    /**
     * Using for rerender data
     * Can be used to destroy some data in component by onBeforeRefresh and onAfterRefresh
     * @returns {Promise<void>}
     */
    async refresh() {
        await this.onBeforeRefresh();
        await this.render();
        await this.onAfterRefresh();
    }

    async onBeforeRefresh() {

    }

    async onAfterRefresh() {

    }

    async update(data) {

    }

    getEventListenerName(eventName) {
        return `ba-${eventName}`;
    }
}

customElements.define(BestAppsComponent.tag, BestAppsComponent);