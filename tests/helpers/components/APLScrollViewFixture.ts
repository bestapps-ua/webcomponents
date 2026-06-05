import { APLComponentFixture } from './APLComponentFixture';

export class APLScrollViewFixture extends APLComponentFixture {
    testScrollView() {
        this.testBase();
        this.testHasEvents(['onFocus', 'onBlur', 'handleKeyDown', 'handleKeyUp']);
    }
}
