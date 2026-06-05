import { browser } from '@wdio/globals';
import { AsyncFixture } from './AsyncFixture';

export class ObjectPaletteFixture extends AsyncFixture {
    async getComponentCount(): Promise<number> {
        return browser.execute((sel: string) => {
            return (document.querySelector(sel) as any).getComponents().length;
        }, this.selector);
    }

    async findByType(type: string): Promise<boolean> {
        return browser.execute((sel: string, t: string) => {
            return !!(document.querySelector(sel) as any).findByType(t);
        }, this.selector, type);
    }

    async getComponentTexts(): Promise<string[]> {
        return browser.execute((sel: string) => {
            const p = document.querySelector(sel) as any;
            return p.getComponents().map((c: any) => {
                const w = c.element?.shadow?.querySelector('.wrapper');
                return w?.textContent || '';
            });
        }, this.selector);
    }

    async isDraggable(index: number): Promise<boolean> {
        return browser.execute((sel: string, i: number) => {
            const p = document.querySelector(sel) as any;
            return p.getComponents()[i]?.getAttribute('draggable') === 'true';
        }, this.selector, index);
    }
}
