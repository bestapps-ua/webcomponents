import { BestAppsComponentFixture } from '../../helpers/Component';

const fixture = new BestAppsComponentFixture('/tests/fixtures/bestapps-component.html', '#component1');

describe('BestAppsComponent', () => {
    before(() => fixture.open());

    fixture.testBestAppsBase();

    it('should generate unique guids per instance', async () => {
        const f2 = new BestAppsComponentFixture('/tests/fixtures/bestapps-component.html', '#component2');
        const guid1 = await fixture.guid();
        const guid2 = await f2.guid();
        expect(guid1).not.toBe(guid2);
    });

    it('should enable debug option via attribute', async () => {
        const debugFixture = new BestAppsComponentFixture('/tests/fixtures/bestapps-component.html', '#debug-component');
        expect(await debugFixture.isDebug()).toBe(true);
    });

    it('should support pub/sub messaging', async () => {
        const received = await fixture.subscribePubSub<{ v: number }>('test-evt', { v: 42 });
        expect(received.v).toBe(42);
    });

    it('should remove subscribeOnce handler after first call', async () => {
        expect(await fixture.subscribeOnceCount('once-test', 3)).toBe(1);
    });

    it('should create components dynamically', async () => {
        const dyn = await fixture.createDynamic('ba-component', 'dynamic1', 'container');
        const guid = await dyn.guid();
        expect(guid).toBeTruthy();
        expect(guid!.length).toBe(12);
    });
});
