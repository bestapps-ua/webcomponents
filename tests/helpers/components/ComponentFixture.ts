import { browser, $, expect } from '@wdio/globals';

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

    async shadowEl(shadowSelector: string) {
        const el = await this.el();
        return el.shadow$(shadowSelector);
    }

    async guid() {
        const el = await this.el();
        return el.getAttribute('guid');
    }

    async getAttribute(name: string) {
        const el = await this.el();
        return el.getAttribute(name);
    }

    async getSize() {
        const el = await this.el();
        return el.getSize();
    }

    async click() {
        const el = await this.el();
        await el.click();
    }

    async hasClass(name: string) {
        return browser.execute(
            (sel: string, cls: string) => document.querySelector(sel)?.classList.contains(cls) ?? false,
            this.selector, name,
        );
    }

    async wrapperStyle(property: string): Promise<string> {
        return browser.execute((sel: string, prop: string) => {
            const el = document.querySelector(sel) as any;
            const wrapper = el.element.shadow.querySelector('.wrapper');
            return getComputedStyle(wrapper)[prop as any];
        }, this.selector, property);
    }

    async hasShadowElement(shadowSelector: string): Promise<boolean> {
        return browser.execute((sel: string, ssel: string) => {
            const el = document.querySelector(sel) as any;
            return !!el.element.shadow.querySelector(ssel);
        }, this.selector, shadowSelector);
    }

    async hasMethod(name: string): Promise<boolean> {
        return browser.execute((sel: string, m: string) => {
            return typeof (document.querySelector(sel) as any)[m] === 'function';
        }, this.selector, name);
    }

    testRenders() {
        it('should render', async () => { await expect(await this.el()).toExist(); });
        it('should have a 12-char guid', async () => {
            const g = await this.guid();
            expect(g).toBeTruthy();
            expect(g!.length).toBe(12);
        });
        it('should have shadow DOM with wrapper', async () => {
            const w = await this.wrapper();
            await expect(w).toExist();
            expect(await w.getAttribute('part')).toBe('wrapper');
        });
        it('should be loaded', async () => { expect(await this.getAttribute('loaded')).toBe('loaded'); });
    }
}
