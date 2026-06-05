import { APLContainerFixture } from '../../helpers/Component';

const fixture = new APLContainerFixture('/tests/fixtures/apl-container.html', '#container1');

describe('APLContainerComponent', () => {
    before(() => fixture.open());

    fixture.testContainer();

    it('position should only have relative and absolute (no sticky)', async () => {
        const def = await fixture.propertyDef('position');
        expect(def!.items).toEqual(['relative', 'absolute']);
        expect(def!.items).not.toContain('sticky');
    });

    it('should merge container and alignment properties', async () => {
        const keys = await fixture.propertyKeys();
        expect(keys).toContain('position');
        expect(keys).toContain('left');
        expect(keys).toContain('top');
        expect(keys).toContain('right');
        expect(keys).toContain('bottom');
    });
});
