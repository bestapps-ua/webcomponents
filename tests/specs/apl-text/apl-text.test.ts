import { browser } from '@wdio/globals';
import {
    APLComponentFixture, testAPLComponentBase,
    testHasProperties, testPositionProperties, testPropertyType,
} from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-text.html', '#text1');

describe('APLTextComponent', () => {
    before(() => fixture.open());

    testAPLComponentBase(fixture);
    testHasProperties(fixture, [
        'text', 'color', 'fontSize', 'fontFamily', 'fontWeight',
        'fontStyle', 'letterSpacing', 'lineHeight', 'maxLines',
        'textAlign', 'textAlignVertical',
    ]);
    testPositionProperties(fixture);
    testPropertyType(fixture, 'fontSize', 'dimension');

    it('typography properties should have CSS mappings', async () => {
        const mapped = await browser.execute(() => {
            const props = (document.getElementById('text1') as any).getAPLProperties();
            return ['fontStyle', 'letterSpacing', 'lineHeight', 'textAlign'].every(
                (k: string) => !!props[k]?.options?.css
            );
        });
        expect(mapped).toBe(true);
    });
});
