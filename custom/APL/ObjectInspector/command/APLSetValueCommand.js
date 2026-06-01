class APLSetValueCommand extends APLCommand {

    #componentId;
    #property;
    #value;

    constructor(props = {}) {
        props.type = props.type || 'SetValue';
        super(props);
        this.componentId = props.componentId;
        this.property = props.property;
        this.value = props.value;
    }

    getAll() {
        let all = super.getAll();
        all = Object.assign(all, {
            componentId:  {
                type: 'text',
            },
            property:  {
                type: 'text',
            },
            value:  {
                type: 'text',
            },
        });
        return all;
    }

    get componentId() {
        return this.#componentId;
    }

    set componentId(value) {
        this.#componentId = value;
    }

    get property() {
        return this.#property;
    }

    set property(value) {
        this.#property = value;
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#value = value;
    }
}