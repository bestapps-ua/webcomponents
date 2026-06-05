import { APLTouchWrapperFixture } from '../../helpers/Component';

const fixture = new APLTouchWrapperFixture('/tests/fixtures/apl-touchwrapper.html', '#touch1');

describe('APLTouchWrapperComponent', () => {
    before(() => fixture.open());

    fixture.testTouchWrapper();

    it('should inherit gesture events from APLTouchableComponent', async () => {
        const keys = await fixture.eventKeys();
        expect(keys).toContain('gesture');
        expect(keys).toContain('gestures');
    });

    it('should inherit keyboard events from APLActionableComponent', async () => {
        const keys = await fixture.eventKeys();
        expect(keys).toContain('handleKeyDown');
        expect(keys).toContain('handleKeyUp');
    });

    it('onCSSSet should set minWidth/maxWidth when width is set', async () => {
        await fixture.applyCSSSet({ width: '200px' });
        expect(await fixture.getStyle('minWidth')).toBe('200px');
        expect(await fixture.getStyle('maxWidth')).toBe('200px');
    });

    it('onCSSSet should set minHeight/maxHeight when height is set', async () => {
        await fixture.applyCSSSet({ height: '100px' });
        expect(await fixture.getStyle('minHeight')).toBe('100px');
        expect(await fixture.getStyle('maxHeight')).toBe('100px');
    });

    it('should capture clicks (shouldCaptureClick)', async () => {
        expect(await fixture.shouldCaptureClick()).toBe(true);
    });
});
