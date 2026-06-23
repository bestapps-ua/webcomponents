/**
 * BestAppsStyleEngine
 *
 * Supplies Tailwind utility classes to BestApps web components that live inside
 * isolated Shadow DOM. A single shared constructable CSSStyleSheet (the
 * "utilities sheet") is populated on demand by the Twind runtime and adopted
 * into every component's shadow root, so a class generated for one component is
 * instantly available to all of them with one sheet total.
 *
 * Twind (vendor/twind/twind.umd.js) is optional: every entry point is guarded so
 * pages/fixtures that don't load it keep working (raw `style` still applies; only
 * utility-class generation is skipped). This mirrors the optional treatment of
 * APLValidationRules in APLProperties.encode().
 *
 * These classes are an authoring/preview convenience for OUR renderer only - they
 * are not part of the Alexa APL contract.
 */
class BestAppsStyleEngine {
    /** @type {CSSStyleSheet} shared utilities sheet adopted by every shadow root */
    static _target;
    /** @type {Function} bound Twind tw() that injects into _target */
    static _tw;
    /** shadow roots that already adopted _target */
    static _roots = new WeakSet();
    static _initialized = false;

    /**
     * Lazily create the shared sheet + Twind instance. Idempotent and safe to
     * call when Twind is absent (leaves the engine inert).
     */
    static init() {
        if (this._initialized) return;
        this._initialized = true;
        if (typeof twind === 'undefined' || typeof CSSStyleSheet === 'undefined') {
            return;
        }
        try {
            this._target = new CSSStyleSheet();
            const sheet = twind.cssomSheet({ target: this._target });
            // preflight:false - we only want utilities in this shared sheet, not a
            // global reset that would be adopted into every component's shadow root.
            const instance = twind.create({ sheet, mode: twind.silent, preflight: false });
            this._tw = instance.tw;
        } catch (err) {
            console.warn('[BestAppsStyleEngine init]', err);
            this._target = undefined;
            this._tw = undefined;
        }
    }

    static isReady() {
        this.init();
        return !!this._tw && !!this._target;
    }

    /**
     * Adopt the shared utilities sheet into a shadow root (once).
     * @param {ShadowRoot} shadowRoot
     */
    static register(shadowRoot) {
        this.init();
        if (!this._target || !shadowRoot || this._roots.has(shadowRoot)) return;
        try {
            shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, this._target];
            this._roots.add(shadowRoot);
        } catch (err) {
            console.warn('[BestAppsStyleEngine register]', err);
        }
    }

    /**
     * Ensure CSS for the given class string exists in the shared sheet.
     * @param {string} classNames space-separated utility/custom classes
     * @returns {string} the class string to apply to the element
     */
    static process(classNames) {
        if (!classNames) return '';
        this.init();
        if (!this._tw) return classNames;
        try {
            return this._tw(classNames);
        } catch (err) {
            console.warn('[BestAppsStyleEngine process]', { classNames, err });
            return classNames;
        }
    }
}
