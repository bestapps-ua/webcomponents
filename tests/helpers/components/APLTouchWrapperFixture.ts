import { browser } from '@wdio/globals';
import { APLComponentFixture } from './APLComponentFixture';

export class APLTouchWrapperFixture extends APLComponentFixture {
    async shouldCaptureClick(): Promise<boolean> {
        return browser.execute((sel: string) => {
            return (document.querySelector(sel) as any).shouldCaptureClick();
        }, this.selector);
    }

    testTouchWrapper() {
        this.testBase();
        this.testPositionProperties();
        this.testHasEvents(['onFocus', 'onBlur', 'onPress', 'onDown', 'onUp', 'onMove', 'onCancel']);
    }
}
