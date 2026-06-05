import { APLScrollViewFixture } from '../../helpers/Component';

const fixture = new APLScrollViewFixture('/tests/fixtures/apl-scrollview.html', '#scroll1');

describe('APLScrollViewComponent', () => {
    before(() => fixture.open());

    fixture.testScrollView();

    it('wrapper should have overflow auto for scrolling', async () => {
        expect(await fixture.wrapperStyle('overflow')).toBe('auto');
    });
});
