/**
 * Manages Alexa device resolution and dp-to-pixel conversion.
 */
class APLScreen {
    static EVENT_RESOLUTION_CHANGE = 'resolution::change';

    /**
     * @property {HTMLElement} container
     */
    container;

    /**
     * @property {width: number, height: number} device
     */
    device;

    /**
     * @property {width: number, height: number} resolution
     */
    resolution;

    constructor(props) {
        this.device = props.device;
        this.resolution = this.device.items[0];
        this.container = props.container;
        this.subscriptions = new Map();
        this.init();
    }

    init() {
        this.resize();
    }

    resize() {
        let dppx = this.getDPSize();
        this.container.style.height = `${this.resolution.height * dppx}px`;
    }

    resizeHeight() {
        this.resize();
    }

    getSubscriptions(action) {
        return this.subscriptions.get(action) || [];
    }

    subscribe(action, callback) {
        let subs = this.getSubscriptions(action);
        subs.push(callback);
        this.subscriptions.set(action, subs);
    }

    emit(action, data) {
        let subs = this.getSubscriptions(action);
        for (const sub of subs) {
            sub(data);
        }
    }

    static getScreens() {
        return {
            'echoShow2': {
                name: 'Echo Show 2',
                items: [
                    {
                        id: 1,
                        width: 1280,
                        height: 800,
                    },
                    {
                        id: 2,
                        width: 1280,
                        height: 750,
                    },
                ],
            },
            'echoShow5': {
                name: 'Echo Show 5',
                items: [
                    {
                        id: 1,
                        width: 960,
                        height: 480,
                    },
                ],
            },
            'echoSpot': {
                name: 'Echo Spot',
                items: [
                    {
                        id: 1,
                        width: 480,
                        height: 480,
                    },
                ],
            },
        }
    }

    getDPSize() {
        return this.container.offsetWidth / this.resolution.width;
    }

    getDevice() {
        return this.device;
    }

    getResolution() {
        return this.resolution;
    }

    setResolution(item) {
        let oldResolution = JSON.parse(JSON.stringify(this.resolution));
        this.resolution = item;
        this.emit(APLScreen.EVENT_RESOLUTION_CHANGE, {old: oldResolution, current: item});
    }

    setDevice(device, resolution) {
        this.device = device;
        resolution = resolution || device.items[0];
        this.setResolution(resolution);
    }

    getSizePixels(val, parentSize) {
        const s = `${val}`;
        if (s.includes('dp')) {
            val = `${this.getDPSize() * parseFloat(s)}px`;
        } else if (s.includes('%') && parentSize) {
            val = `${parseFloat(s) * parentSize / 100}px`;
        } else if (s.includes('px')) {
            val = `${this.getDPSize() * parseFloat(s)}px`;
        }
        return val;
    }
}