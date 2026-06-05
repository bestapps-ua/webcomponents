import { browser } from '@wdio/globals';
import { AsyncFixture } from './AsyncFixture';

export class APLScreenFixture extends AsyncFixture {
    async getDeviceNames(): Promise<string[]> {
        return browser.execute((sel: string) => {
            const el = document.querySelector(sel) as any;
            const selects = el.element.shadow.querySelectorAll('select');
            return Array.from(selects[0].options).map((o: any) => o.textContent);
        }, this.selector);
    }

    async getResolutionText(): Promise<string> {
        return browser.execute((sel: string) => {
            const el = document.querySelector(sel) as any;
            const selects = el.element.shadow.querySelectorAll('select');
            return selects[1].options[0].textContent;
        }, this.selector);
    }

    async getScreenDeviceName(): Promise<string> {
        return browser.execute((flag: string) => {
            return (window as any)[flag]?.getDevice()?.name;
        }, this.readyFlag);
    }
}
