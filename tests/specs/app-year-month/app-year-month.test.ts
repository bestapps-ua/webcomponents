import { AppYearMonthFixture } from '../../helpers/Component';

const fixture = new AppYearMonthFixture('/tests/fixtures/app-year-month.html', '#picker');

describe('AppYearMonthComponent', () => {
    before(() => fixture.open());

    fixture.testRenders();

    it('should display formatted year-month in the input', async () => {
        expect(await fixture.getInputValue()).toBe('May 2024');
    });

    it('should have a read-only input', async () => {
        expect(await fixture.isInputReadOnly()).toBe(true);
    });

    it('should contain year and month sub-selectors', async () => {
        expect(await fixture.hasShadowElement('year-month-select-year-component')).toBe(true);
        expect(await fixture.hasShadowElement('year-month-select-month-component')).toBe(true);
    });

    it('should have selectors hidden by default', async () => {
        expect(await fixture.getSelectorDisplay('year-month-select-year-component')).toBe('none');
    });

    it('should show year selector on input click', async () => {
        await fixture.clickInput();
        expect(await fixture.getSelectorDisplay('year-month-select-year-component')).toBe('block');
    });

    it('should expose year and month getters', async () => {
        expect(await fixture.getYear()).toBe(2024);
        expect(await fixture.getMonth()).toBe('May');
    });
});
