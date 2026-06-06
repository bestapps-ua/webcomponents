import { browser, expect } from '@wdio/globals';

describe('AppYearMonth popup in flex layout', () => {
    before(async () => {
        await browser.url('/tests/fixtures/app-year-month-flex.html');
        const el = await $('#picker-flex');
        await el.waitUntil(
            async function () { return (await this.getAttribute('loaded')) === 'loaded'; },
            { timeout: 5000 },
        );
    });

    afterEach(async () => {
        await browser.execute(() => {
            const picker = document.getElementById('picker-flex') as any;
            const yearSel = picker.shadowRoot?.querySelector('year-month-select-year-component');
            const monthSel = picker.shadowRoot?.querySelector('year-month-select-month-component');
            yearSel?.hide();
            monthSel?.hide();
        });
    });

    it('should have host stretched taller than input by flex layout', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-flex') as any;
            const input = picker.shadowRoot.querySelector('input');
            const hostHeight = picker.getBoundingClientRect().height;
            const inputHeight = input.getBoundingClientRect().height;
            return { hostHeight, inputHeight };
        });
        expect(result.hostHeight).toBeGreaterThan(result.inputHeight * 5);
    });

    it('should position popup below input, not at host bottom', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-flex') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const wrapper = yearSel.shadowRoot.querySelector('.wrapper');
            const hostRect = picker.getBoundingClientRect();
            const inputRect = input.getBoundingClientRect();
            const popupRect = wrapper.getBoundingClientRect();
            return {
                hostBottom: Math.round(hostRect.bottom),
                inputBottom: Math.round(inputRect.bottom),
                popupTop: Math.round(popupRect.top),
            };
        });
        expect(result.popupTop).toBe(result.inputBottom);
        expect(result.popupTop).not.toBe(result.hostBottom);
    });

    it('should reposition popup on window resize', async () => {
        const before = await browser.execute(() => {
            const picker = document.getElementById('picker-flex') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const wrapper = yearSel.shadowRoot.querySelector('.wrapper');
            return {
                popupLeft: Math.round(wrapper.getBoundingClientRect().left),
                inputLeft: Math.round(input.getBoundingClientRect().left),
            };
        });
        expect(before.popupLeft).toBe(before.inputLeft);

        const origSize = await browser.getWindowSize();

        await browser.setWindowSize(800, 600);
        await browser.pause(300);

        const after = await browser.execute(() => {
            const picker = document.getElementById('picker-flex') as any;
            const input = picker.shadowRoot.querySelector('input');
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const wrapper = yearSel.shadowRoot.querySelector('.wrapper');
            const inputRect = input.getBoundingClientRect();
            const popupRect = wrapper.getBoundingClientRect();
            return {
                popupLeft: Math.round(popupRect.left),
                popupTop: Math.round(popupRect.top),
                inputLeft: Math.round(inputRect.left),
                inputBottom: Math.round(inputRect.bottom),
            };
        });
        expect(after.popupLeft).toBe(after.inputLeft);
        expect(after.popupTop).toBe(after.inputBottom);

        await browser.setWindowSize(origSize.width, origSize.height);
    });

    it('should remove resize listener when popup is hidden', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-flex') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const hasHandlerWhileOpen = !!(yearSel as any)._resizeHandler;
            yearSel.hide();
            const wrapper = yearSel.shadowRoot.querySelector('.wrapper');
            const oldLeft = wrapper.style.left;
            window.dispatchEvent(new Event('resize'));
            const newLeft = wrapper.style.left;
            return {
                hasHandlerWhileOpen,
                positionUnchangedAfterHide: oldLeft === newLeft,
            };
        });
        expect(result.hasHandlerWhileOpen).toBe(true);
        expect(result.positionUnchangedAfterHide).toBe(true);
    });

    it('should position month popup below input in flex layout', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-flex') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const yearWrapper = yearSel.shadowRoot.querySelector('.wrapper');
            const yearItems = yearWrapper.querySelectorAll('.year-container');
            if (yearItems.length > 0) yearItems[0].click();

            const monthSel = picker.shadowRoot.querySelector('year-month-select-month-component');
            const monthWrapper = monthSel.shadowRoot.querySelector('.wrapper');
            const inputRect = input.getBoundingClientRect();
            const monthRect = monthWrapper.getBoundingClientRect();
            const hostRect = picker.getBoundingClientRect();
            return {
                inputBottom: Math.round(inputRect.bottom),
                monthTop: Math.round(monthRect.top),
                hostBottom: Math.round(hostRect.bottom),
                monthVisible: monthSel.style.display,
            };
        });
        expect(result.monthVisible).toBe('block');
        expect(result.monthTop).toBe(result.inputBottom);
        expect(result.monthTop).not.toBe(result.hostBottom);
    });
});
