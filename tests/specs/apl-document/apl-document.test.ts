import { browser } from '@wdio/globals';
import { ComponentFixture, testRendersComponent } from '../../helpers/Component';

const fixture = new ComponentFixture('/tests/fixtures/apl-document.html', '#doc1');

describe('APLDocumentComponent', () => {
    before(() => fixture.open());

    testRendersComponent(fixture);

    it('should have black background on wrapper', async () => {
        const bg = await browser.execute(() => {
            const el = document.getElementById('doc1') as any;
            const wrapper = el.element.shadow.querySelector('.wrapper');
            return getComputedStyle(wrapper).backgroundColor;
        });
        expect(bg).toBe('rgb(0, 0, 0)');
    });

    it('should have flex column layout on wrapper', async () => {
        const dir = await browser.execute(() => {
            const el = document.getElementById('doc1') as any;
            const wrapper = el.element.shadow.querySelector('.wrapper');
            return getComputedStyle(wrapper).flexDirection;
        });
        expect(dir).toBe('column');
    });

    it('should fill its container', async () => {
        const el = await fixture.el();
        const size = await el.getSize();
        expect(size.width).toBeGreaterThan(0);
        expect(size.height).toBeGreaterThan(0);
    });
});
