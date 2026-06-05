import { APLComponentFixture } from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-component.html', '#apl1');

describe('APLComponent', () => {
    before(() => fixture.open());

    fixture.testBase();

    it('should store APL identity (name, type, number)', async () => {
        expect(await fixture.aplName()).toBe('TestComponent');
        expect(await fixture.aplType()).toBe('APLTest');
        expect(await fixture.aplNumber()).toBe(1);
    });

    it('should set apl-name and apl-type attributes', async () => {
        expect(await fixture.getAttribute('apl-name')).toBe('TestComponent');
        expect(await fixture.getAttribute('apl-type')).toBe('APLTest');
    });

    it('should manage child items list', async () => {
        await fixture.addItem('guid-a');
        await fixture.addItem('guid-b');
        expect(await fixture.getItemCount()).toBe(2);
        await fixture.removeItem('guid-a');
        expect(await fixture.getItemCount()).toBe(1);
    });

    it('should have an APLData object', async () => {
        expect(await fixture.hasAPLData()).toBe(true);
    });

    it('should have addEventCleanup method', async () => {
        expect(await fixture.hasMethod('addEventCleanup')).toBe(true);
    });

    it('disconnectedCallback should run cleanup functions', async () => {
        expect(await fixture.verifyCleanupOnRemove('apl-component')).toBe(true);
    });

    it('disconnectedCallback should clear pub/sub subscriptions', async () => {
        expect(await fixture.verifyPubSubClearOnRemove('apl-component')).toBe(false);
    });
});
