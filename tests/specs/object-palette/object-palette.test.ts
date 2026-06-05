import { ObjectPaletteFixture } from '../../helpers/Component';

const fixture = new ObjectPaletteFixture('/tests/fixtures/object-palette.html', '#palette1', '_testReady');

describe('ObjectPalette', () => {
    before(() => fixture.open());

    it('should render the palette component', async () => {
        const el = await fixture.el();
        await expect(el).toExist();
        expect(await el.getAttribute('loaded')).toBe('loaded');
    });

    it('should have shadow DOM with wrapper', async () => {
        const wrapper = await fixture.wrapper();
        await expect(wrapper).toExist();
    });

    it('should contain 3 palette items', async () => {
        expect(await fixture.getComponentCount()).toBe(3);
    });

    it('should find components by type', async () => {
        expect(await fixture.findByType('Button')).toBe(true);
        expect(await fixture.findByType('Container')).toBe(true);
        expect(await fixture.findByType('Image')).toBe(true);
    });

    it('should return false for unknown type', async () => {
        expect(await fixture.findByType('Unknown')).toBe(false);
    });

    it('should render items as draggable', async () => {
        expect(await fixture.isDraggable(0)).toBe(true);
    });

    it('should display component type as text', async () => {
        const texts = await fixture.getComponentTexts();
        expect(texts).toContain('Button');
        expect(texts).toContain('Container');
        expect(texts).toContain('Image');
    });
});
