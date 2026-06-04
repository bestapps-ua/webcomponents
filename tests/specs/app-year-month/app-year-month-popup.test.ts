import { browser, expect } from '@wdio/globals';

describe('AppYearMonth popup positioning', () => {
    before(async () => {
        await browser.url('/tests/fixtures/app-year-month-popup.html');
        const el = await $('#picker-top');
        await el.waitUntil(
            async function () { return (await this.getAttribute('loaded')) === 'loaded'; },
            { timeout: 5000 },
        );
        const el2 = await $('#picker-bottom');
        await el2.waitUntil(
            async function () { return (await this.getAttribute('loaded')) === 'loaded'; },
            { timeout: 5000 },
        );
    });

    afterEach(async () => {
        await browser.execute(() => {
            for (const picker of document.querySelectorAll('ba-app-year-month-component') as any) {
                const yearSel = picker.shadowRoot?.querySelector('year-month-select-year-component');
                const monthSel = picker.shadowRoot?.querySelector('year-month-select-month-component');
                yearSel?.hide();
                monthSel?.hide();
            }
        });
    });

    it('should position year popup directly below the picker (top placement)', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-top') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const wrapper = yearSel.shadowRoot.querySelector('.wrapper');
            const pickerRect = picker.getBoundingClientRect();
            const popupRect = wrapper.getBoundingClientRect();
            return {
                pickerBottom: Math.round(pickerRect.bottom),
                popupTop: Math.round(popupRect.top),
                pickerLeft: Math.round(pickerRect.left),
                popupLeft: Math.round(popupRect.left),
            };
        });
        expect(result.popupTop).toBe(result.pickerBottom);
        expect(result.popupLeft).toBe(result.pickerLeft);
    });

    it('should flip year popup above picker when at bottom of viewport', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-bottom') as any;
            picker.scrollIntoView({ block: 'end' });
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const wrapper = yearSel.shadowRoot.querySelector('.wrapper');
            const pickerRect = picker.getBoundingClientRect();
            const popupRect = wrapper.getBoundingClientRect();
            return {
                pickerTop: Math.round(pickerRect.top),
                popupBottom: Math.round(popupRect.bottom),
                popupTop: Math.round(popupRect.top),
                viewportH: window.innerHeight,
                popupFullyVisible: popupRect.top >= 0 && popupRect.bottom <= window.innerHeight,
            };
        });
        expect(result.popupBottom).toBeLessThanOrEqual(result.pickerTop + 1);
        expect(result.popupFullyVisible).toBe(true);
    });

    it('should have z-index high enough to overlay other content', async () => {
        const zIndex = await browser.execute(() => {
            const picker = document.getElementById('picker-top') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const wrapper = yearSel.shadowRoot.querySelector('.wrapper');
            return parseInt(getComputedStyle(wrapper).zIndex) || 0;
        });
        expect(zIndex).toBeGreaterThanOrEqual(9999);
    });

    it('should use position:fixed on popup wrapper', async () => {
        const position = await browser.execute(() => {
            const picker = document.getElementById('picker-top') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const wrapper = yearSel.shadowRoot.querySelector('.wrapper');
            return getComputedStyle(wrapper).position;
        });
        expect(position).toBe('fixed');
    });

    it('should position month popup after year selection', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-top') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();

            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const yearWrapper = yearSel.shadowRoot.querySelector('.wrapper');
            const yearItems = yearWrapper.querySelectorAll('.year-container');
            if (yearItems.length > 0) yearItems[0].click();

            const monthSel = picker.shadowRoot.querySelector('year-month-select-month-component');
            const monthWrapper = monthSel.shadowRoot.querySelector('.wrapper');
            const pickerRect = picker.getBoundingClientRect();
            const monthRect = monthWrapper.getBoundingClientRect();
            const monthVisible = monthSel.style.display;
            return {
                pickerBottom: Math.round(pickerRect.bottom),
                monthTop: Math.round(monthRect.top),
                pickerLeft: Math.round(pickerRect.left),
                monthLeft: Math.round(monthRect.left),
                monthVisible,
            };
        });
        expect(result.monthVisible).toBe('block');
        expect(result.monthTop).toBe(result.pickerBottom);
        expect(result.monthLeft).toBe(result.pickerLeft);
    });

    it('should close popups on outside click', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-top') as any;
            const input = picker.shadowRoot.querySelector('input');
            input.click();
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');
            const beforeDisplay = yearSel.style.display;

            document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            const afterDisplay = yearSel.style.display;
            return { beforeDisplay, afterDisplay };
        });
        expect(result.beforeDisplay).toBe('block');
        expect(result.afterDisplay).toBe('none');
    });

    it('should toggle popup on repeated input clicks', async () => {
        const result = await browser.execute(() => {
            const picker = document.getElementById('picker-top') as any;
            const input = picker.shadowRoot.querySelector('input');
            const yearSel = picker.shadowRoot.querySelector('year-month-select-year-component');

            input.click();
            const afterFirst = yearSel.style.display;
            input.click();
            const afterSecond = yearSel.style.display;
            return { afterFirst, afterSecond };
        });
        expect(result.afterFirst).toBe('block');
        expect(result.afterSecond).toBe('none');
    });
});
