import { browser, expect } from '@wdio/globals';

describe('APLDataComponent', () => {
    before(async () => {
        await browser.url('/tests/fixtures/apl-data-component.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testReady),
            { timeout: 8000, timeoutMsg: 'APLDataComponent fixture not ready' },
        );
    });

    // --- Lifecycle ---

    it('should render and reach loaded state', async () => {
        const el = await $('#datacomp1');
        await expect(el).toExist();
        expect(await el.getAttribute('loaded')).toBe('loaded');
    });

    it('should have shadow DOM with wrapper', async () => {
        const el = await $('#datacomp1');
        const wrapper = await el.shadow$('.wrapper');
        await expect(wrapper).toExist();
    });

    // --- JSONEditor rendering ---

    it('should create a jsoneditor container in light DOM', async () => {
        const hasDiv = await browser.execute(() => {
            const el = document.getElementById('datacomp1') as any;
            return !!el.querySelector('.jsoneditor');
        });
        expect(hasDiv).toBe(true);
    });

    it('should use code mode (Ace editor)', async () => {
        const hasAce = await browser.execute(() => {
            const el = document.getElementById('datacomp1') as any;
            return !!el.querySelector('.ace_editor');
        });
        expect(hasAce).toBe(true);
    });

    // --- Document data ---

    it('should expose the document via aplDocument property', async () => {
        const docType = await browser.execute(() => {
            const el = document.getElementById('datacomp1') as any;
            return el.aplDocument?.type;
        });
        expect(docType).toBe('APL');
    });

    it('should expose a jsoneditor instance', async () => {
        const hasEditor = await browser.execute(() => {
            const el = document.getElementById('datacomp1') as any;
            return !!el.jsoneditor && typeof el.jsoneditor.getText === 'function';
        });
        expect(hasEditor).toBe(true);
    });

    it('should contain the full document JSON text', async () => {
        const text = await browser.execute(() => {
            const el = document.getElementById('datacomp1') as any;
            return el.jsoneditor.getText();
        });
        const json = JSON.parse(text);
        expect(json.type).toBe('APL');
        expect(json.version).toBe('1.4');
        expect(json.mainTemplate.items[0].type).toBe('Container');
        expect(json.mainTemplate.items[0].items[0].type).toBe('Image');
        expect(json.mainTemplate.items[0].items[0].scale).toBe('best-fit');
    });

    // --- Live update (refresh) ---

    it('should refresh when underlying data is mutated', async () => {
        const scaleAfter = await browser.execute(() => {
            const el = document.getElementById('datacomp1') as any;
            (window as any)._sampleDoc.mainTemplate.items[0].items[0].scale = 'fill';
            el.refresh();
            const text = el.jsoneditor.getText();
            return JSON.parse(text).mainTemplate.items[0].items[0].scale;
        });
        expect(scaleAfter).toBe('fill');
    });

    it('should update after setDocument with new data', async () => {
        const version = await browser.execute(() => {
            const el = document.getElementById('datacomp1') as any;
            el.setDocument({ type: 'APL', version: '2.0', mainTemplate: { items: [] } });
            const text = el.jsoneditor.getText();
            return JSON.parse(text).version;
        });
        expect(version).toBe('2.0');
    });

    // --- Console errors ---

    it('should have no console errors', async () => {
        const errors = await browser.execute(() => (window as any)._consoleErrors);
        const relevant = errors.filter(
            (e: string) => !e.includes('[deprecation]') && !e.includes('favicon'),
        );
        expect(relevant).toHaveLength(0);
    });

    it('should have no critical console warnings', async () => {
        const warnings = await browser.execute(() => (window as any)._consoleWarnings);
        const critical = warnings.filter(
            (w: string) => w.includes('TypeError') || w.includes('ReferenceError') || w.includes('Failed to'),
        );
        expect(critical).toHaveLength(0);
    });
});
