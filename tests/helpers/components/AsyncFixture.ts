import { browser } from '@wdio/globals';
import { ComponentFixture } from './ComponentFixture';

export class AsyncFixture extends ComponentFixture {
    constructor(fixturePath: string, selector: string, protected readonly readyFlag: string) {
        super(fixturePath, selector);
    }

    async open() {
        await browser.url(this.fixturePath);
        await browser.waitUntil(
            async () => browser.execute(`return !!(window).${this.readyFlag}`),
            { timeout: 8000, timeoutMsg: `${this.fixturePath} not ready` },
        );
        await this.waitForLoaded();
    }
}
