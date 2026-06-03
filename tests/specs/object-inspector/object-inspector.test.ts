import { browser, $, expect } from '@wdio/globals';
import { AsyncFixture, testRendersComponent } from '../../helpers/Component';

const fixture = new AsyncFixture(
    '/tests/fixtures/object-inspector.html',
    '#inspector1',
    'return !!(window as any)._testReady',
);

describe('ObjectInspector', () => {
    before(async () => {
        await browser.url('/tests/fixtures/object-inspector.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testReady),
            { timeout: 8000, timeoutMsg: 'Inspector fixture not ready' },
        );
    });

    it('should render the inspector component', async () => {
        const el = await $('#inspector1');
        await expect(el).toExist();
        expect(await el.getAttribute('loaded')).toBe('loaded');
    });

    it('should have shadow DOM with wrapper', async () => {
        const el = await $('#inspector1');
        const wrapper = await el.shadow$('.wrapper');
        await expect(wrapper).toExist();
    });

    it('should contain an objects selector sub-component', async () => {
        const has = await browser.execute(() => {
            const el = document.getElementById('inspector1') as any;
            return !!el.objectsSelectorComponent;
        });
        expect(has).toBe(true);
    });

    it('should track registered components', async () => {
        const count = await browser.execute(() => {
            return (document.getElementById('inspector1') as any).getComponents().length;
        });
        expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should have the current component set', async () => {
        const name = await browser.execute(() => {
            const c = (document.getElementById('inspector1') as any).getComponent();
            return c?.getAttribute('name');
        });
        expect(name).toBe('Widget1');
    });

    it('should render tabs inside the objects selector', async () => {
        const hasTabs = await browser.execute(() => {
            const el = document.getElementById('inspector1') as any;
            return !!el.objectsSelectorComponent.tabsComponent;
        });
        expect(hasTabs).toBe(true);
    });

    it('should show Properties tab', async () => {
        const tabNames = await browser.execute(() => {
            const el = document.getElementById('inspector1') as any;
            return el.objectsSelectorComponent.tabsComponent.getTabs().map((t: any) => t.name);
        });
        expect(tabNames).toContain('Properties');
    });
});
