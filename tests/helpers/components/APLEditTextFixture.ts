import { APLComponentFixture } from './APLComponentFixture';

export class APLEditTextFixture extends APLComponentFixture {
    testEditText() {
        this.testBase();
        this.testHasProperties(['text', 'color']);
        this.testPropertyType('color', 'color');
    }
}
