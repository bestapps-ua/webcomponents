import { browser, expect } from '@wdio/globals';

describe('APLDom', () => {
    before(async () => {
        await browser.url('/tests/fixtures/apl-dom.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testReady),
            { timeout: 5000 },
        );
    });

    it('should start with empty items', async () => {
        const count = await browser.execute(() => {
            return (window as any)._aplDom.getItems().length;
        });
        expect(count).toBe(0);
    });

    it('addByComponent should add to the tree', async () => {
        const result = await browser.execute(() => {
            const w = window as any;
            const dom = w._aplDom;
            dom.addByComponent(w._parent, { guid: null });
            return dom.getItems().length;
        });
        expect(result).toBe(1);
    });

    it('addByComponent should nest children under parent', async () => {
        const result = await browser.execute(() => {
            const w = window as any;
            const dom = w._aplDom;
            dom.addByComponent(w._child1, w._parent);
            dom.addByComponent(w._child2, w._parent);
            const parentItem = dom.findByGuid(w._parent.guid);
            return {
                childCount: parentItem.items.length,
                child1Level: dom.findByGuid(w._child1.guid).level,
                child2Level: dom.findByGuid(w._child2.guid).level,
            };
        });
        expect(result.childCount).toBe(2);
        expect(result.child1Level).toBe(1);
        expect(result.child2Level).toBe(1);
    });

    it('findByGuid should find nested items', async () => {
        const found = await browser.execute(() => {
            const w = window as any;
            const item = w._aplDom.findByGuid(w._child1.guid);
            return !!item && item.guid === w._child1.guid;
        });
        expect(found).toBe(true);
    });

    it('findByGuid should use index for O(1) lookup', async () => {
        const result = await browser.execute(() => {
            const w = window as any;
            const dom = w._aplDom;
            return dom._guidIndex.has(w._child1.guid);
        });
        expect(result).toBe(true);
    });

    it('findByGuid should return falsy for missing guid', async () => {
        const found = await browser.execute(() => {
            return !!(window as any)._aplDom.findByGuid('nonexistent-guid');
        });
        expect(found).toBe(false);
    });

    it('getChildrenFlatList should flatten all descendants', async () => {
        const count = await browser.execute(() => {
            const w = window as any;
            const parentItem = w._aplDom.findByGuid(w._parent.guid);
            return w._aplDom.getChildrenFlatList(parentItem).length;
        });
        expect(count).toBe(2);
    });

    it('getParentChain should return ancestors sorted by level', async () => {
        const result = await browser.execute(() => {
            const w = window as any;
            const childItem = w._aplDom.findByGuid(w._child1.guid);
            const chain = w._aplDom.getParentChain(childItem);
            return {
                length: chain.length,
                firstGuid: chain[0]?.guid,
            };
        });
        expect(result.length).toBe(1);
    });

    it('isOnSameLevel should detect siblings', async () => {
        const result = await browser.execute(() => {
            const w = window as any;
            const dom = w._aplDom;
            const item1 = dom.findByGuid(w._child1.guid);
            const item2 = dom.findByGuid(w._child2.guid);
            return dom.isOnSameLevel(item1, item2);
        });
        expect(result).toBe(true);
    });

    it('removeByGuid should remove from tree and index', async () => {
        const result = await browser.execute(() => {
            const w = window as any;
            const dom = w._aplDom;
            const guid = w._child2.guid;
            dom.removeByGuid(guid);
            const parentItem = dom.findByGuid(w._parent.guid);
            return {
                childCount: parentItem.items.length,
                inIndex: dom._guidIndex.has(guid),
                found: !!dom.findByGuid(guid),
            };
        });
        expect(result.childCount).toBe(1);
        expect(result.inIndex).toBe(false);
        expect(result.found).toBe(false);
    });

    it('getNodeChildren should wrap single item in array', async () => {
        const result = await browser.execute(() => {
            const w = window as any;
            const dom = w._aplDom;
            const nodeWithItem = { item: { type: 'Text' } };
            const nodeWithItems = { items: [{ type: 'Text' }, { type: 'Frame' }] };
            const nodeEmpty = {};
            return {
                singleLen: dom.getNodeChildren(nodeWithItem).length,
                multiLen: dom.getNodeChildren(nodeWithItems).length,
                emptyLen: dom.getNodeChildren(nodeEmpty).length,
            };
        });
        expect(result.singleLen).toBe(1);
        expect(result.multiLen).toBe(2);
        expect(result.emptyLen).toBe(0);
    });
});
