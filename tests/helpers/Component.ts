import { browser, $, $$, expect } from '@wdio/globals';

/**
 * Base test fixture for any BestAppsComponent.
 * Single Responsibility: page lifecycle + element queries.
 * Open/Closed: extend for APL specifics without modifying.
 */
export class ComponentFixture {
    constructor(
        protected readonly fixturePath: string,
        protected readonly selector: string,
    ) {}

    async open() {
        await browser.url(this.fixturePath);
        await this.waitForLoaded();
    }

    async waitForLoaded() {
        const el = await $(this.selector);
        await el.waitUntil(
            async function () {
                return (await this.getAttribute('loaded')) === 'loaded';
            },
            { timeout: 5000, timeoutMsg: `${this.selector} did not load` },
        );
    }

    async el() { return $(this.selector); }

    async wrapper() {
        const el = await this.el();
        return el.shadow$('.wrapper');
    }

    async guid() {
        const el = await this.el();
        return el.getAttribute('guid');
    }

    async hasClass(name: string) {
        return browser.execute(
            (sel: string, cls: string) => document.querySelector(sel)?.classList.contains(cls) ?? false,
            this.selector, name,
        );
    }
}

/**
 * Fixture for APLComponent and subclasses.
 * Adds property/event introspection.
 */
export class APLComponentFixture extends ComponentFixture {
    async propertyKeys(): Promise<string[]> {
        return browser.execute((sel: string) => {
            const el = document.querySelector(sel) as any;
            if (!el?.getAPLProperties) return [];
            return Object.keys(el.getAPLProperties()).filter((k: string) => k !== 'onCSSSet');
        }, this.selector);
    }

    async propertyDef(key: string) {
        return browser.execute((sel: string, k: string) => {
            const el = document.querySelector(sel) as any;
            const prop = el?.getAPLProperties()?.[k];
            if (!prop) return null;
            const copy: Record<string, any> = {};
            for (const p of Object.keys(prop)) {
                if (typeof prop[p] !== 'function') copy[p] = JSON.parse(JSON.stringify(prop[p]));
            }
            return copy;
        }, this.selector, key);
    }

    async eventKeys(): Promise<string[]> {
        return browser.execute((sel: string) => {
            const el = document.querySelector(sel) as any;
            if (!el?.getAPLEvents) return [];
            return Object.keys(el.getAPLEvents());
        }, this.selector);
    }

    async aplName() {
        return browser.execute((sel: string) => (document.querySelector(sel) as any)?.getAPLName?.(), this.selector);
    }

    async aplType() {
        return browser.execute((sel: string) => (document.querySelector(sel) as any)?.getAPLType?.(), this.selector);
    }
}

/**
 * Fixture for components that need a custom readiness signal.
 */
export class AsyncFixture extends ComponentFixture {
    constructor(fixturePath: string, selector: string, private readonly readyFlag: string) {
        super(fixturePath, selector);
    }
    async open() {
        await browser.url(this.fixturePath);
        await browser.waitUntil(
            async () => browser.execute(`return !!(window).${this.readyFlag}`),
            { timeout: 8000, timeoutMsg: `${this.fixturePath} not ready` },
        );
        await this.waitForLoaded();
    }
}

// --- Shared test suites (DRY) ---

export function testRendersComponent(fixture: ComponentFixture) {
    it('should render', async () => { await expect(await fixture.el()).toExist(); });
    it('should have a 12-char guid', async () => {
        const g = await fixture.guid();
        expect(g).toBeTruthy();
        expect(g!.length).toBe(12);
    });
    it('should have shadow DOM with wrapper', async () => {
        const w = await fixture.wrapper();
        await expect(w).toExist();
        expect(await w.getAttribute('part')).toBe('wrapper');
    });
    it('should be loaded', async () => { expect(await (await fixture.el()).getAttribute('loaded')).toBe('loaded'); });
}

export function testAPLComponentBase(fixture: APLComponentFixture) {
    testRendersComponent(fixture);
    it('should have apl-component class', async () => { expect(await fixture.hasClass('apl-component')).toBe(true); });
    it('should have base APL properties', async () => {
        const keys = await fixture.propertyKeys();
        for (const p of ['name', 'width', 'height', 'padding']) expect(keys).toContain(p);
    });
}

export function testHasProperties(fixture: APLComponentFixture, props: string[]) {
    it(`should have properties: ${props.join(', ')}`, async () => {
        const keys = await fixture.propertyKeys();
        for (const p of props) expect(keys).toContain(p);
    });
}

export function testHasEvents(fixture: APLComponentFixture, events: string[]) {
    it(`should have events: ${events.join(', ')}`, async () => {
        const keys = await fixture.eventKeys();
        for (const ev of events) expect(keys).toContain(ev);
    });
}

export function testPropertyType(fixture: APLComponentFixture, key: string, expectedType: string) {
    it(`"${key}" should be type "${expectedType}"`, async () => {
        const def = await fixture.propertyDef(key);
        expect(def).toBeTruthy();
        expect(def!.type).toBe(expectedType);
    });
}

export function testPropertyDefault(fixture: APLComponentFixture, key: string, val: any) {
    it(`"${key}" should default to "${val}"`, async () => {
        const def = await fixture.propertyDef(key);
        expect(def).toBeTruthy();
        expect(def!.default).toBe(val);
    });
}

export function testPositionProperties(fixture: APLComponentFixture) {
    testHasProperties(fixture, ['position', 'left', 'top', 'right', 'bottom']);
}
