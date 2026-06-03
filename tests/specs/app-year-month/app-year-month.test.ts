import { browser, expect } from '@wdio/globals';
import { ComponentFixture, testRendersComponent } from '../../helpers/Component';

const fixture = new ComponentFixture('/tests/fixtures/app-year-month.html', '#picker');

describe('AppYearMonthComponent', () => {
    before(() => fixture.open());

    testRendersComponent(fixture);

    it('should display formatted year-month in the input', async () => {
        const el = await fixture.el();
        const input = await el.shadow$('input.year-month-input');
        expect(await input.getValue()).toBe('May 2024');
    });

    it('should have a read-only input', async () => {
        const el = await fixture.el();
        const input = await el.shadow$('input.year-month-input');
        expect(await input.getAttribute('readonly')).not.toBeNull();
    });

    it('should contain year and month sub-selectors', async () => {
        const el = await fixture.el();
        await expect(el.shadow$('year-month-select-year-component')).toExist();
        await expect(el.shadow$('year-month-select-month-component')).toExist();
    });

    it('should have selectors hidden by default', async () => {
        const hidden = await browser.execute(() => {
            const el = document.getElementById('picker') as any;
            return el.element.shadow.querySelector('year-month-select-year-component').style.display;
        });
        expect(hidden).toBe('none');
    });

    it('should show year selector on input click', async () => {
        const el = await fixture.el();
        const input = await el.shadow$('input.year-month-input');
        await input.click();
        const display = await browser.execute(() => {
            const el = document.getElementById('picker') as any;
            return el.element.shadow.querySelector('year-month-select-year-component').style.display;
        });
        expect(display).toBe('block');
    });

    it('should expose year and month getters', async () => {
        const data = await browser.execute(() => {
            const el = document.getElementById('picker') as any;
            return { year: el.getYear(), month: el.getMonth() };
        });
        expect(data.year).toBe(2024);
        expect(data.month).toBe('May');
    });
});
