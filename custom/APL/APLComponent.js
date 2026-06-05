/**
 * APL BASE Component
 * https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-component.html
 */
class APLComponent extends BestAppsComponent {
    static tag = 'apl-component';

    static EVENT_PARENT_SET = 'parent::set';
    static EVENT_PARENT_CHANGED = 'parent::changed';
    static EVENT_MOVED = 'moved';

    /**
     * @property {APLFactory} factory
     */
    factory;

    items = [];

    APLName;
    APLNumber;
    APLType;
    APLData = {};
    _eventCleanups = [];

    /**
     * @property {APLComponent} APLParent
     */
    APLParent;

    APLProperties = {
        name: {
            type: 'text',
            options: {
                apl: 'id',
                property: 'name',
            }
        },
        height: {
            type: 'dimension',
            default: '100%',
            options: {
                css: ['maxHeight', 'height'],
            }
        },
        minHeight: {
            type: 'text',
            options: {
                css: true,
            }
        },
        maxHeight: {
            type: 'text',
            options: {
                css: true,
            }
        },
        width: {
            type: 'dimension',
            default: '100%',
            options: {
                css: ['maxWidth', 'width'],
            }
        },
        minWidth: {
            type: 'dimension',
            options: {
                //css: true,
            }
        },
        maxWidth: {
            type: 'dimension',
            options: {
                css: true,
            }
        },
        padding: {
            type: 'dimension',
            options: {
                css: true,
            }
        },
        paddingLeft: {
            type: 'dimension',
            options: {
                css: true,
            }
        },
        paddingTop: {
            type: 'dimension',
            options: {
                css: true,
            }
        },
        paddingRight: {
            type: 'dimension',
            options: {
                css: true,
            }
        },
        paddingBottom: {
            type: 'dimension',
            options: {
                css: true,
            }
        },

    }

    APLEvents = {};

    onCSSSet() {
        let data = this.getAPLData();
        let parent = this.parentElement;
        let ml = this.style.marginLeft;
        let mr = this.style.marginRight;
        let mt = this.style.marginTop;
        let mb = this.style.marginBottom;
        let w = parent?.offsetWidth;
        let h = parent?.offsetHeight;
        this.style.maxWidth = `calc(${w}px - ${ml} - ${mr})`;
        this.style.maxHeight = `calc(${h}px - ${mb} - ${mt})`;

        if (data.position === 'absolute') {
            let screen = this.getFactory().getScreen();
            if (parseFloat(data.left) > 0) {
                this.style['left'] = screen.getSizePixels(data.left, parent?.offsetWidth);
            }
            if (parseFloat(data.top) > 0) {
                this.style['top'] = screen.getSizePixels(data.top, parent?.offsetHeight);
            }
            if (parseFloat(data.right) > 0) {
                this.style['right'] = screen.getSizePixels(data.right, parent?.offsetWidth);
            }
            if (parseFloat(data.bottom) > 0) {
                this.style['bottom'] = screen.getSizePixels(data.bottom, parent?.offsetHeight);
            }
        }
    }

    getAPLProperties() {
        return this.APLProperties;
    }

    getAPLEvents() {
        return this.APLEvents;
    }

    shouldCaptureClick() {
        return false;
    }

    renderContent() {
        this.element.wrapper.textContent = this.getAPLName();
    }

    setAPLName(APLName) {
        this.APLName = APLName;
        this.setAttribute('apl-name', APLName);
    }

    getAPLName() {
        return this.APLName;
    }

    setAPLNumber(APLNumber) {
        this.APLNumber = APLNumber;
        this.setAttribute('apl-number', APLNumber);
    }

    getAPLNumber() {
        return this.APLNumber;
    }

    setAPLType(APLType) {
        this.APLType = APLType;
        this.setAttribute('apl-type', APLType);
    }

    getAPLType() {
        return this.APLType;
    }

    setAPLData(APLData) {
        this.APLData = APLData;
    }

    getAPLData() {
        return this.APLData;
    }


    setFactory(factory) {
        this.factory = factory;
    }

    /**
     *
     * @returns {APLFactory}
     */
    getFactory() {
        return this.factory;
    }

    getItems() {
        return this.items;
    }

    addItem(guid) {
        let idx = this.items.indexOf(guid);
        if (idx === -1) {
            this.items.push(guid);
        }
    }

    removeItem(guid) {
        let idx = this.items.indexOf(guid);
        this.items.splice(idx, 1);
    }

    async initElements() {
        await super.initElements();
        this.classList.add('apl-component');
    }

    async processOptions(options) {
        options = await super.processOptions(options);
        this.setFactory(options.factory);
        return options;
    }

    getStyle() {

        return `
            :host {
                box-sizing: border-box;
                background-color: white;
                flex: 1 0;
            }
            :host(.selected) {
                border: 1px solid red;
                .wrapper {
                    border: 1px dashed red; 
                }
            }
            .wrapper {
                width: 100%;
                height: 100%;               
                display: inline-flex;
                flex-direction: column;
                //border: 1px dashed black;
                box-sizing: border-box;
                overflow: hidden;
                span.apl-name {
                     mix-blend-mode: difference;
                }
            }
            .ba-component {
                width: 100%;
                height: 100%;
            }            
        `;
    }

    /**
     *
     * @param {APLComponent} parent
     */
    async setAPLParent(parent) {
        if (this.getAPLParent() && this.getAPLParent().guid === parent.guid) {
            return;
        }
        let oldParent = this.APLParent;
        let oldParentGuid;
        if (oldParent) {
            oldParentGuid = oldParent.guid;
        }
        this.APLParent = parent;

        let clonedComponent;
        if (oldParent) {

            //TODO: change in APLData
        } else {

        }
        if (oldParentGuid && oldParentGuid !== parent.guid) {

            this.dispatchEvent(new CustomEvent(APLComponent.EVENT_PARENT_CHANGED, {
                bubbles: true,
                composed: true,
                detail: {
                    component: this,
                    parent: parent.guid,
                    oldParent: oldParentGuid
                }
            }));
        }

        this.publish(APLComponent.EVENT_PARENT_SET, {
            component: clonedComponent || this,
            parent: parent.guid,
            oldParent: oldParentGuid
        });
    }

    getAPLParent() {
        return this.APLParent;
    }

    addEventCleanup(cleanup) {
        this._eventCleanups.push(cleanup);
    }

    disconnectedCallback() {
        for (const cleanup of this._eventCleanups) {
            cleanup();
        }
        this._eventCleanups = [];
        this.pubsub.clear();
    }
}

customElements.define(APLComponent.tag, APLComponent);