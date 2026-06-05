import { APLDocumentFixture } from '../../helpers/Component';

const fixture = new APLDocumentFixture('/tests/fixtures/apl-document.html', '#doc1');

describe('APLDocumentComponent', () => {
    before(() => fixture.open());

    fixture.testDocument();

    it('should fill its container', async () => {
        const el = await fixture.el();
        const size = await el.getSize();
        expect(size.width).toBeGreaterThan(0);
        expect(size.height).toBeGreaterThan(0);
    });
});
