import { ObjectInspectorFixture } from '../../helpers/Component';

const fixture = new ObjectInspectorFixture('/tests/fixtures/object-inspector.html', '#inspector1', '_testReady');

describe('ObjectInspector', () => {
    before(() => fixture.open());

    it('should render the inspector component', async () => {
        const el = await fixture.el();
        await expect(el).toExist();
        expect(await el.getAttribute('loaded')).toBe('loaded');
    });

    it('should have shadow DOM with wrapper', async () => {
        const wrapper = await fixture.wrapper();
        await expect(wrapper).toExist();
    });

    it('should contain an objects selector sub-component', async () => {
        expect(await fixture.hasObjectsSelector()).toBe(true);
    });

    it('should track registered components', async () => {
        expect(await fixture.getComponentCount()).toBeGreaterThanOrEqual(1);
    });

    it('should have the current component set', async () => {
        expect(await fixture.getCurrentComponentName()).toBe('Widget1');
    });

    it('should render tabs inside the objects selector', async () => {
        const tabs = await fixture.getTabNames();
        expect(tabs.length).toBeGreaterThan(0);
    });

    it('should show Properties tab', async () => {
        const tabs = await fixture.getTabNames();
        expect(tabs).toContain('Properties');
    });
});
