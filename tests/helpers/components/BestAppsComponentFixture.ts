import { browser } from '@wdio/globals';
import { ComponentFixture } from './ComponentFixture';

export class BestAppsComponentFixture extends ComponentFixture {
    async getOptions(): Promise<Record<string, any>> {
        return browser.execute((sel: string) => {
            return (document.querySelector(sel) as any).getOptions();
        }, this.selector);
    }

    async isDebug(): Promise<boolean> {
        const opts = await this.getOptions();
        return !!opts.debug;
    }

    async subscribePubSub<T>(event: string, publishData: any): Promise<T> {
        return browser.execute((sel: string, evt: string, data: any) => {
            return new Promise<any>((resolve) => {
                const el = document.querySelector(sel) as any;
                el.subscribe(evt, (d: any) => resolve(d));
                el.pubsub.publish(evt, data);
            });
        }, this.selector, event, publishData);
    }

    async subscribeOnceCount(event: string, publishTimes: number): Promise<number> {
        return browser.execute((sel: string, evt: string, times: number) => {
            return new Promise<number>((resolve) => {
                const el = document.querySelector(sel) as any;
                let count = 0;
                el.pubsub.subscribeOnce(evt, () => { count++; });
                for (let i = 0; i < times; i++) el.pubsub.publish(evt, {});
                resolve(count);
            });
        }, this.selector, event, publishTimes);
    }

    async createDynamic(tagName: string, id: string, containerId: string): Promise<BestAppsComponentFixture> {
        await browser.execute((tag: string, elId: string, cId: string) => {
            const el = document.createElement(tag);
            el.id = elId;
            document.getElementById(cId)!.appendChild(el);
        }, tagName, id, containerId);
        const fixture = new BestAppsComponentFixture(this.fixturePath, `#${id}`);
        await fixture.waitForLoaded();
        return fixture;
    }

    testBestAppsBase() {
        this.testRenders();
        it('should have ba-component CSS class', async () => {
            expect(await this.hasClass('ba-component')).toBe(true);
        });
    }
}
