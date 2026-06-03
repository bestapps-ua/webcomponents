import {
    APLComponentFixture, testAPLComponentBase,
    testHasProperties, testPositionProperties, testPropertyType,
} from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-frame.html', '#frame1');

describe('APLFrameComponent', () => {
    before(() => fixture.open());

    testAPLComponentBase(fixture);
    testHasProperties(fixture, ['background', 'backgroundColor', 'borderColor', 'borderRadius', 'borderWidth']);
    testPositionProperties(fixture);
    testPropertyType(fixture, 'background', 'color');
    testPropertyType(fixture, 'backgroundColor', 'color');
    testPropertyType(fixture, 'borderColor', 'color');
    testPropertyType(fixture, 'borderRadius', 'dimension');
});
