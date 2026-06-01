import { browser, $ } from '@wdio/globals';
import { ComponentFixture, testRendersComponent } from '../../helpers/Component';

const fixture = new ComponentFixture('/tests/fixtures/bestapps-component.html', '#component1');

describe('BestAppsComponent', () => {
    before(() => fixture.open());

    testRendersComponent(fixture);

    it('should have ba-component CSS class', async () => {
        expect(await fixture.hasClass('ba-component')).toBe(true);
    });

    it('should generate unique guids per instance', async () => {
        const f2 = new ComponentFixture('/tests/fixtures/bestapps-component.html', '#component2');
        const guid1 = await fixture.guid();
        const guid2 = await f2.guid();
        expect(guid1).not.toBe(guid2);
    });

    it('should enable debug option via attribute', async () => {
        const debug = await browser.execute(() => {
            return (document.getElementById('debug-component') as any).getOptions().debug;
        });
        expect(debug).toBe(true);
    });

    it('should support pub/sub messaging', async () => {
        const received = await browser.execute(() => {
            return new Promise<number>((resolve) => {
                const el = document.getElementById('component1') as any;
                el.subscribe('test-evt', (data: any) => resolve(data.v));
                el.pubsub.publish('test-evt', { v: 42 });
            });
        });
        expect(received).toBe(42);
    });

    it('should remove subscribeOnce handler after first call', async () => {
        const callCount = await browser.execute(() => {
            return new Promise<number>((resolve) => {
                const el = document.getElementById('component1') as any;
                let count = 0;
                el.pubsub.subscribeOnce('once-test', () => { count++; });
                el.pubsub.publish('once-test', {});
                el.pubsub.publish('once-test', {});
                el.pubsub.publish('once-test', {});
                resolve(count);
            });
        });
        expect(callCount).toBe(1);
    });

    it('should create components dynamically', async () => {
        await browser.execute(() => {
            const el = document.createElement('ba-component');
            el.id = 'dynamic1';
            document.getElementById('container')!.appendChild(el);
        });
        const dyn = new ComponentFixture('/tests/fixtures/bestapps-component.html', '#dynamic1');
        await dyn.waitForLoaded();
        const guid = await dyn.guid();
        expect(guid).toBeTruthy();
        expect(guid!.length).toBe(12);
    });
});
