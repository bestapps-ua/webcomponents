import { APLScreenFixture } from '../../helpers/Component';

const fixture = new APLScreenFixture('/tests/fixtures/apl-screen.html', '#screen1', '_testScreen');

describe('APLScreenComponent', () => {
    before(() => fixture.open());

    it('should render the component', async () => {
        await expect(await fixture.el()).toExist();
    });

    it('should have shadow DOM with wrapper', async () => {
        await expect(await fixture.wrapper()).toExist();
    });

    it('should render device select dropdown', async () => {
        expect(await fixture.hasShadowElement('select')).toBe(true);
    });

    it('should list all device options', async () => {
        const names = await fixture.getDeviceNames();
        expect(names).toContain('Echo Show 2');
        expect(names).toContain('Echo Show 5');
        expect(names).toContain('Echo Spot');
    });

    it('should show resolution for current device', async () => {
        const res = await fixture.getResolutionText();
        expect(res).toContain('1280x800');
    });

    it('should expose APLScreen with correct device', async () => {
        expect(await fixture.getScreenDeviceName()).toBe('Echo Show 2');
    });
});
