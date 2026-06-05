import { APLEditTextFixture } from '../../helpers/Component';

const fixture = new APLEditTextFixture('/tests/fixtures/apl-edittext.html', '#edittext1');

describe('APLEditTextComponent', () => {
    before(() => fixture.open());

    fixture.testEditText();

    it('should render an input element inside the shadow DOM', async () => {
        expect(await fixture.hasShadowElement('input')).toBe(true);
    });
});
