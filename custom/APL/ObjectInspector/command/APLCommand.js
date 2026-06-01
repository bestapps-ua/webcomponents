class APLCommand {
    #uid;
    #props;
    #type;
    #description;
    #delay;
    #screenLock;
    #sequencer;
    #when;

    constructor(props = {}) {
        this.uid = this.generateUid();
        this.props = props;
        props.uid = this.uid;
        this.type = props.type;
        this.description = props.description;
        this.delay = props.delay;
        this.screenLock = props.screenLock;
        this.sequencer = props.sequencer;
        this.when = props.when;
    }

    getAPLData() {
        let all = this.getAll();
        let props = {};
        for (const key in all) {
            props[key] = this[key];
        }
        return props;
    }

    getAll() {
        return {
            type: {
                type: 'text',
            },
            description:  {
                type: 'text',
            },
            delay:  {
                type: 'text',
            },
            screenLock:  {
                type: 'text',
            },
            sequencer:  {
                type: 'text',
            },
            when:  {
                type: 'text',
            },
        };
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

    getOther(){
        let props = {};
        let all = this.getAll();
        let keys = Object.keys(all);
        for (const prop of keys) {
            if(this.props[prop]) continue;
            props[prop] = {
                type: 'text',
                default: this.props[prop],
            };
        }
        return props;
    }

    get when() {
        return this.#when;
    }

    set when(value) {
        this.#when = value;
    }
    get sequencer() {
        return this.#sequencer;
    }

    set sequencer(value) {
        this.#sequencer = value;
    }
    get screenLock() {
        return this.#screenLock;
    }

    set screenLock(value) {
        this.#screenLock = value;
    }
    get delay() {
        return this.#delay;
    }

    set delay(value) {
        this.#delay = value;
    }
    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = value;
    }
    get type() {
        return this.#type;
    }

    set type(value) {
        this.#type = value;
    }

    get props() {
        return this.#props;
    }

    set props(value) {
        this.#props = value;
    }

    get uid() {
        return this.#uid;
    }

    set uid(value) {
        this.#uid = value;
    }
}