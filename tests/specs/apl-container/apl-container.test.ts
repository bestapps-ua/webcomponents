import {
    APLComponentFixture, testAPLComponentBase,
    testHasProperties, testPositionProperties, testPropertyType, testPropertyDefault,
} from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-container.html', '#container1');

describe('APLContainerComponent', () => {
    before(() => fixture.open());

    testAPLComponentBase(fixture);
    testHasProperties(fixture, ['alignItems', 'direction', 'wrap', 'justifyContent', 'shadowColor']);
    testPropertyType(fixture, 'direction', 'list');
    testPropertyType(fixture, 'alignItems', 'list');
    testPropertyDefault(fixture, 'direction', 'column');
    testPropertyDefault(fixture, 'alignItems', 'stretch');
    testPropertyDefault(fixture, 'wrap', 'noWrap');
    testPropertyDefault(fixture, 'justifyContent', 'start');
    testPositionProperties(fixture);
});
