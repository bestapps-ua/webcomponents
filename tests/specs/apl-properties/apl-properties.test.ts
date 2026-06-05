import { browser, expect } from '@wdio/globals';

describe('APLProperties', () => {
    before(async () => {
        await browser.url('/tests/fixtures/apl-properties.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testReady),
            { timeout: 5000 },
        );
    });

    describe('getContainerProperties()', () => {
        it('should return position as a list property', async () => {
            const def = await browser.execute(() => {
                return APLProperties.getContainerProperties().position;
            });
            expect(def.type).toBe('list');
        });

        it('should only contain relative and absolute (no sticky)', async () => {
            const items = await browser.execute(() => {
                return APLProperties.getContainerProperties().position.items;
            });
            expect(items).toEqual(['relative', 'absolute']);
            expect(items).not.toContain('sticky');
        });

        it('should default to relative', async () => {
            const def = await browser.execute(() => {
                return APLProperties.getContainerProperties().position.default;
            });
            expect(def).toBe('relative');
        });
    });

    describe('getAlignmentAndPositioningProperties()', () => {
        it('should have left, top, right, bottom as dimension', async () => {
            const props = await browser.execute(() => {
                const p = APLProperties.getAlignmentAndPositioningProperties();
                return {
                    leftType: p.left.type,
                    topType: p.top.type,
                    rightType: p.right.type,
                    bottomType: p.bottom.type,
                };
            });
            expect(props.leftType).toBe('dimension');
            expect(props.topType).toBe('dimension');
            expect(props.rightType).toBe('dimension');
            expect(props.bottomType).toBe('dimension');
        });
    });

    describe('encode()', () => {
        it('should store value in APLData', async () => {
            const result = await browser.execute(() => {
                const el = document.getElementById('apl1') as any;
                el.setAPLData({});
                el.setFactory({ getScreen: () => ({ getSizePixels: (v: any) => v, getDPSize: () => 1 }) });
                APLProperties.encode(el, 'height', '200dp');
                return el.getAPLData().height;
            });
            expect(result).toBe('200dp');
        });

        it('should apply CSS when css option is set', async () => {
            const result = await browser.execute(() => {
                const el = document.getElementById('apl1') as any;
                el.setAPLData({});
                el.setFactory({ getScreen: () => ({ getSizePixels: (v: any) => `${parseFloat(v)}px`, getDPSize: () => 1 }) });
                APLProperties.encode(el, 'padding', '10dp');
                return el.style.padding;
            });
            expect(result).toBe('10px');
        });
    });

    describe('decode()', () => {
        it('should resolve values from data', async () => {
            const result = await browser.execute(() => {
                const properties = {
                    myProp: { type: 'text', default: 'fallback', options: {} },
                };
                const data = { myProp: 'hello' };
                const decoded = APLProperties.decode(properties, data);
                return decoded.myProp.value;
            });
            expect(result).toBe('hello');
        });

        it('should use default when data value is missing', async () => {
            const result = await browser.execute(() => {
                const properties = {
                    myProp: { type: 'text', default: 'fallback', options: {} },
                };
                const decoded = APLProperties.decode(properties, {});
                return decoded.myProp.value;
            });
            expect(result).toBe('fallback');
        });

        it('should deep-clone property definitions', async () => {
            const result = await browser.execute(() => {
                const properties = {
                    myProp: { type: 'text', default: '', options: { css: true } },
                };
                const decoded = APLProperties.decode(properties, { myProp: 'test' });
                decoded.myProp.options.css = false;
                return properties.myProp.options.css;
            });
            expect(result).toBe(true);
        });
    });
});
