import { browser, expect } from '@wdio/globals';
import { ComponentFixture } from '../../helpers/Component';

const fixture = new ComponentFixture('/tests/fixtures/apl-screen.html', '#screen1');

describe('APLScreenComponent', () => {
    before(async () => {
        await browser.url('/tests/fixtures/apl-screen.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testScreen),
            { timeout: 5000 },
        );
        await fixture.waitForLoaded();
    });

    it('should render the component', async () => {
        const el = await fixture.el();
        await expect(el).toExist();
    });

    it('should have shadow DOM with wrapper', async () => {
        const wrapper = await fixture.wrapper();
        await expect(wrapper).toExist();
    });

    it('should render device select dropdown', async () => {
        const el = await fixture.el();
        const select = await el.shadow$('select');
        await expect(select).toExist();
    });

    it('should list all device options', async () => {
        const names = await browser.execute(() => {
            const el = document.getElementById('screen1') as any;
            const selects = el.element.shadow.querySelectorAll('select');
            const deviceSelect = selects[0];
            return Array.from(deviceSelect.options).map((o: any) => o.textContent);
        });
        expect(names).toContain('Echo Show 2');
        expect(names).toContain('Echo Show 5');
        expect(names).toContain('Echo Spot');
    });

    it('should show resolution for current device', async () => {
        const res = await browser.execute(() => {
            const el = document.getElementById('screen1') as any;
            const selects = el.element.shadow.querySelectorAll('select');
            const resSelect = selects[1];
            return resSelect.options[0].textContent;
        });
        expect(res).toContain('1280x800');
    });

    it('should expose APLScreen with correct device', async () => {
        const device = await browser.execute(() => {
            return (window as any)._testScreen.getDevice().name;
        });
        expect(device).toBe('Echo Show 2');
    });
});
