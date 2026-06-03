import {
    APLComponentFixture, testAPLComponentBase,
    testPositionProperties, testHasEvents,
} from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-touchwrapper.html', '#touch1');

describe('APLTouchWrapperComponent', () => {
    before(() => fixture.open());

    testAPLComponentBase(fixture);
    testPositionProperties(fixture);
    testHasEvents(fixture, ['onFocus', 'onBlur', 'onPress', 'onDown', 'onUp', 'onMove', 'onCancel']);

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
});
