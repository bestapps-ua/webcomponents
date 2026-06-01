import { browser } from '@wdio/globals';
import { APLComponentFixture, testAPLComponentBase, testHasEvents } from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-scrollview.html', '#scroll1');

describe('APLScrollViewComponent', () => {
    before(() => fixture.open());

    testAPLComponentBase(fixture);
    testHasEvents(fixture, ['onFocus', 'onBlur', 'handleKeyDown', 'handleKeyUp']);

    it('wrapper should have overflow auto for scrolling', async () => {
        const overflow = await browser.execute(() => {
            const el = document.getElementById('scroll1') as any;
            const wrapper = el.element.shadow.querySelector('.wrapper');
            return getComputedStyle(wrapper).overflow;
        });
        expect(overflow).toBe('auto');
    });
});
