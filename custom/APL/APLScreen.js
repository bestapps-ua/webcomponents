/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
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
        this.resizeHeight();
    }

    resizeHeight() {
        let dppx = this.getDPSize();
        let h = this.resolution.height * dppx;
        this.container.style.height = `${h}px`;
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
        if (`${val}`.includes('dp')) {
            val = `${this.getDPSize() * parseFloat(val)}px`;
        } else if (`${val}`.includes('%') && parentSize) {
            val = parseFloat(val) * parentSize / 100;
            val = `${val}px`;
        }
        return val;
    }
}