import { APLFrameFixture } from '../../helpers/Component';

const fixture = new APLFrameFixture('/tests/fixtures/apl-frame.html', '#frame1');

describe('APLFrameComponent', () => {
    before(() => fixture.open());

    fixture.testFrame();

    it('borderWidth should be dimension type', async () => {
        const def = await fixture.propertyDef('borderWidth');
        expect(def!.type).toBe('dimension');
    });

    it('onCSSSet should apply borderWidth with px unit and solid style', async () => {
        await fixture.applyCSSSet({ borderWidth: '3' });
        expect(await fixture.getStyle('borderWidth')).toBe('3px');
        expect(await fixture.getStyle('borderStyle')).toBe('solid');
    });
});
