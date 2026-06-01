import { browser } from '@wdio/globals';
import {
    APLComponentFixture, testAPLComponentBase,
    testHasProperties, testPropertyType,
} from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-edittext.html', '#edittext1');

describe('APLEditTextComponent', () => {
    before(() => fixture.open());

    testAPLComponentBase(fixture);
    testHasProperties(fixture, ['text', 'color']);
    testPropertyType(fixture, 'color', 'color');

    it('should render an input element inside the shadow DOM', async () => {
        const hasInput = await browser.execute(() => {
            const el = document.getElementById('edittext1') as any;
            return !!el.element.shadow.querySelector('input');
        });
        expect(hasInput).toBe(true);
    });
});
