import { expect } from '@wdio/globals';
import {
    APLComponentFixture, testAPLComponentBase,
    testHasProperties, testPositionProperties, testPropertyType, testPropertyDefault,
} from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-image.html', '#image1');

describe('APLImageComponent', () => {
    before(() => fixture.open());

    testAPLComponentBase(fixture);
    testHasProperties(fixture, ['source', 'sources', 'scale', 'align', 'borderRadius']);
    testPropertyType(fixture, 'scale', 'list');
    testPropertyDefault(fixture, 'scale', 'best-fit');
    testPositionProperties(fixture);

    it('should have all scale options', async () => {
        const def = await fixture.propertyDef('scale');
        expect(def!.items).toEqual(['fill', 'best-fill', 'best-fit', 'best-fit-down', 'none']);
    });
});
