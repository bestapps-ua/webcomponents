import { browser } from '@wdio/globals';
import { APLComponentFixture, testAPLComponentBase } from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/apl-component.html', '#apl1');

describe('APLComponent', () => {
    before(() => fixture.open());

    testAPLComponentBase(fixture);

    it('should store APL identity (name, type, number)', async () => {
        expect(await fixture.aplName()).toBe('TestComponent');
        expect(await fixture.aplType()).toBe('APLTest');
        const num = await browser.execute(() => {
            return (document.getElementById('apl1') as any).getAPLNumber();
        });
        expect(num).toBe(1);
    });

    it('should set apl-name and apl-type attributes', async () => {
        const el = await fixture.el();
        expect(await el.getAttribute('apl-name')).toBe('TestComponent');
        expect(await el.getAttribute('apl-type')).toBe('APLTest');
    });

    it('should manage child items list', async () => {
        const result = await browser.execute(() => {
            const el = document.getElementById('apl1') as any;
            el.addItem('guid-a');
            el.addItem('guid-b');
            const count = el.getItems().length;
            el.removeItem('guid-a');
            return { before: count, after: el.getItems().length };
        });
        expect(result.before).toBe(2);
        expect(result.after).toBe(1);
    });

    it('should have an APLData object', async () => {
        const isObj = await browser.execute(() => {
            return typeof (document.getElementById('apl1') as any).getAPLData() === 'object';
        });
        expect(isObj).toBe(true);
    });
});
