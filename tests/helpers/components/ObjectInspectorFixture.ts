import { browser } from '@wdio/globals';
import { AsyncFixture } from './AsyncFixture';

export class ObjectInspectorFixture extends AsyncFixture {
    async getComponentCount(): Promise<number> {
        return browser.execute((sel: string) => {
            return (document.querySelector(sel) as any).getComponents().length;
        }, this.selector);
    }

    async getCurrentComponentName(): Promise<string | null> {
        return browser.execute((sel: string) => {
            const c = (document.querySelector(sel) as any).getComponent();
            return c?.getAttribute('name') ?? null;
        }, this.selector);
    }

    async hasObjectsSelector(): Promise<boolean> {
        return browser.execute((sel: string) => {
            return !!(document.querySelector(sel) as any).objectsSelectorComponent;
        }, this.selector);
    }

    async getTabNames(): Promise<string[]> {
        return browser.execute((sel: string) => {
            const el = document.querySelector(sel) as any;
            return el.objectsSelectorComponent.tabsComponent.getTabs().map((t: any) => t.name);
        }, this.selector);
    }
}
