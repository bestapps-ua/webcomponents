import { APLComponentFixture } from './APLComponentFixture';

export class APLFrameFixture extends APLComponentFixture {
    testFrame() {
        this.testBase();
        this.testHasProperties(['background', 'backgroundColor', 'borderColor', 'borderRadius', 'borderWidth']);
        this.testPositionProperties();
        this.testPropertyType('background', 'color');
        this.testPropertyType('backgroundColor', 'color');
        this.testPropertyType('borderColor', 'color');
        this.testPropertyType('borderRadius', 'dimension');
    }
}
