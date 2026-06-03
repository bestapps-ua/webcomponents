import { browser } from '@wdio/globals';
import { ComponentFixture, testRendersComponent } from '../../helpers/Component';

const fixture = new ComponentFixture('/tests/fixtures/object-palette.html', '#palette1');

describe('ObjectPalette', () => {
    before(async () => {
        await browser.url('/tests/fixtures/object-palette.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testReady),
            { timeout: 5000, timeoutMsg: 'Palette fixture not ready' },
        );
    });

    it('should render the palette component', async () => {
        const el = await fixture.el();
        await expect(el).toExist();
        expect(await el.getAttribute('loaded')).toBe('loaded');
    });

    it('should have shadow DOM with wrapper', async () => {
        const wrapper = await fixture.wrapper();
        await expect(wrapper).toExist();
    });

    it('should contain 3 palette items', async () => {
        const count = await browser.execute(() => {
            return (document.getElementById('palette1') as any).getComponents().length;
        });
        expect(count).toBe(3);
    });

    it('should find components by type', async () => {
        const found = await browser.execute(() => {
            const p = document.getElementById('palette1') as any;
            return !!p.findByType('Button') && !!p.findByType('Container') && !!p.findByType('Image');
        });
        expect(found).toBe(true);
    });

    it('should return null for unknown type', async () => {
        const found = await browser.execute(() => {
            return (document.getElementById('palette1') as any).findByType('Unknown');
        });
        expect(found).toBeFalsy();
    });

    it('should render items as draggable', async () => {
        const draggable = await browser.execute(() => {
            const p = document.getElementById('palette1') as any;
            const comp = p.getComponents()[0];
            return comp.getAttribute('draggable');
        });
        expect(draggable).toBe('true');
    });

    it('should display component type as text', async () => {
        const texts = await browser.execute(() => {
            const p = document.getElementById('palette1') as any;
            return p.getComponents().map((c: any) => {
                const w = c.element?.shadow?.querySelector('.wrapper');
                return w?.textContent || '';
            });
        });
        expect(texts).toContain('Button');
        expect(texts).toContain('Container');
        expect(texts).toContain('Image');
    });
});
