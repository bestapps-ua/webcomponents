import { browser } from '@wdio/globals';
import { ComponentFixture } from './ComponentFixture';

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

    async aplNumber(): Promise<number> {
        return browser.execute((sel: string) => {
            return (document.querySelector(sel) as any).getAPLNumber();
        }, this.selector);
    }

    async addItem(guid: string): Promise<void> {
        await browser.execute((sel: string, g: string) => {
            (document.querySelector(sel) as any).addItem(g);
        }, this.selector, guid);
    }

    async removeItem(guid: string): Promise<void> {
        await browser.execute((sel: string, g: string) => {
            (document.querySelector(sel) as any).removeItem(g);
        }, this.selector, guid);
    }

    async getItemCount(): Promise<number> {
        return browser.execute((sel: string) => {
            return (document.querySelector(sel) as any).getItems().length;
        }, this.selector);
    }

    async hasAPLData(): Promise<boolean> {
        return browser.execute((sel: string) => {
            return typeof (document.querySelector(sel) as any).getAPLData() === 'object';
        }, this.selector);
    }

    async applyCSSSet(data: Record<string, any>): Promise<void> {
        await browser.execute((sel: string, d: Record<string, any>) => {
            const el = document.querySelector(sel) as any;
            el.setAPLData(d);
            el.setFactory({ getScreen: () => ({ getSizePixels: (v: any) => v, getDPSize: () => 1 }) });
            el.onCSSSet();
        }, this.selector, data);
    }

    async getStyle(property: string): Promise<string> {
        return browser.execute((sel: string, prop: string) => {
            return (document.querySelector(sel) as any).style[prop];
        }, this.selector, property);
    }

    async hasCSSMapping(key: string): Promise<boolean> {
        return browser.execute((sel: string, k: string) => {
            const props = (document.querySelector(sel) as any).getAPLProperties();
            return !!props[k]?.options?.css;
        }, this.selector, key);
    }

    async verifyCleanupOnRemove(tagName: string): Promise<boolean> {
        return browser.execute((tag: string) => {
            const el = document.createElement(tag) as any;
            document.body.appendChild(el);
            let cleaned = false;
            el.addEventCleanup(() => { cleaned = true; });
            el.remove();
            return cleaned;
        }, tagName);
    }

    async verifyPubSubClearOnRemove(tagName: string): Promise<boolean> {
        return browser.execute((tag: string) => {
            const el = document.createElement(tag) as any;
            document.body.appendChild(el);
            let called = false;
            el.subscribe('test-event', () => { called = true; });
            el.remove();
            el.publish('test-event', {});
            return called;
        }, tagName);
    }

    testBase() {
        this.testRenders();
        it('should have apl-component class', async () => { expect(await this.hasClass('apl-component')).toBe(true); });
        it('should have base APL properties', async () => {
            const keys = await this.propertyKeys();
            for (const p of ['name', 'width', 'height', 'padding']) expect(keys).toContain(p);
        });
    }

    testHasProperties(props: string[]) {
        it(`should have properties: ${props.join(', ')}`, async () => {
            const keys = await this.propertyKeys();
            for (const p of props) expect(keys).toContain(p);
        });
    }

    testHasEvents(events: string[]) {
        it(`should have events: ${events.join(', ')}`, async () => {
            const keys = await this.eventKeys();
            for (const ev of events) expect(keys).toContain(ev);
        });
    }

    testPropertyType(key: string, expectedType: string) {
        it(`"${key}" should be type "${expectedType}"`, async () => {
            const def = await this.propertyDef(key);
            expect(def).toBeTruthy();
            expect(def!.type).toBe(expectedType);
        });
    }

    testPropertyDefault(key: string, val: any) {
        it(`"${key}" should default to "${val}"`, async () => {
            const def = await this.propertyDef(key);
            expect(def).toBeTruthy();
            expect(def!.default).toBe(val);
        });
    }

    testPositionProperties() {
        this.testHasProperties(['position', 'left', 'top', 'right', 'bottom']);
    }
}
