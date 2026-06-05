import { APLComponentFixture } from './APLComponentFixture';

export class APLContainerFixture extends APLComponentFixture {
    testContainer() {
        this.testBase();
        this.testHasProperties(['alignItems', 'direction', 'wrap', 'justifyContent', 'shadowColor']);
        this.testPositionProperties();
        this.testPropertyType('direction', 'list');
        this.testPropertyType('alignItems', 'list');
        this.testPropertyDefault('direction', 'column');
        this.testPropertyDefault('alignItems', 'stretch');
        this.testPropertyDefault('wrap', 'noWrap');
        this.testPropertyDefault('justifyContent', 'start');
    }
}
