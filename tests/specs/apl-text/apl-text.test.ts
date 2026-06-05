import { APLTextFixture } from '../../helpers/Component';

const fixture = new APLTextFixture('/tests/fixtures/apl-text.html', '#text1');

describe('APLTextComponent', () => {
    before(() => fixture.open());

    fixture.testText();

    it('typography properties should have CSS mappings', async () => {
        for (const key of ['fontStyle', 'letterSpacing', 'lineHeight', 'textAlign']) {
            expect(await fixture.hasCSSMapping(key)).toBe(true);
        }
    });

    it('color property should have CSS mapping', async () => {
        expect(await fixture.hasCSSMapping('color')).toBe(true);
    });
});
