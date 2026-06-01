class APLSendEventCommand extends APLCommand {

    #arguments;
    #components;
    #flags;

    constructor(props = {}) {
        props.type = props.type || 'SendEvent';
        super(props);
        this.arguments = props['arguments'] || [];
        this.components = props.components || [];
        this.flags = props.flags;
    }

    getAll() {
        let all = super.getAll();
        all = Object.assign(all, {
            arguments:  {
                type: 'array',
            },
            components:  {
                type: 'array',
            },
            flags:  {
                type: 'text',
            },
        });
        return all;
    }

    get arguments() {
        return this.#arguments;
    }

    set arguments(value) {
        this.#arguments = value;
    }

    get components() {
        return this.#arguments;
    }

    set components(value) {
        this.#components = value;
    }

    get flags() {
        return this.#flags;
    }

    set flags(value) {
        this.#flags = value;
    }
}