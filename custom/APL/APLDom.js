class APLDom {

    /**
     * @property {Object} aplDocument
     */
    aplDocument;

    /**
     * @property {Array} items
     */
    items = [];

    constructor(props) {
        this.aplDocument = props.aplDocument;
    }

    setAplDocument(aplDocument) {
        this.aplDocument = aplDocument;
    }

    addByComponent(component, parentComponent = undefined, index = -1) {
        let guid = component.guid;
        let item = {
            component,
            guid,
            index: 0,
            level: 0,
            parent: undefined,
            items: [],
        };

        let items = this.getItems();
        let parent = this.findByGuid(parentComponent.guid);
        if (parent) {
            item.level = parent.level + 1;
            items = parent.items;
            item.parent = parent;
        }

        if (index === -1) {
            items.push(item);
        } else {
            items.splice(index, 0, item);
        }
        this.refreshIndexes(items);
    }

    removeByGuid(guid) {
        let item = this.findByGuid(guid);
        let items = this.getItems();
        if (item.parent) {
            items = item.parent.items;
        }
        items.splice(item.index, 1);
        this.refreshIndexes(items);
    }

    getItems() {
        return this.items;
    }

    findByGuid(guid, items = undefined) {
        items = items || this.getItems();
        for (const item of items) {
            if (item.guid === guid) {
                return item;
            }
            if (item.items.length > 0) {
                let found = this.findByGuid(guid, item.items);
                if (found) {
                    return found;
                }
            }
        }
    }

    findByComponent(component) {
        return this.findByGuid(component.guid);
    }

    refreshIndexes(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].index = i;
        }
    }

    /**
     * Must return merge with information what need to refresh
     * @param oldComponent
     * @param toParentComponent
     */
    move(oldComponent, toParentComponent) {
        // console.log('MOVE TO', oldComponent);
        let moveTo = this.getComponentData(toParentComponent);
        console.log('MOVE TO DATA', oldComponent, moveTo);
        let merge = {
            moveTo,
            remove: undefined,
        };
        let toDelete = this.getComponentData(oldComponent);
        console.log('TO DELETE DATA', toParentComponent, toDelete);
        merge.remove = toDelete;
        return merge;
    }

    getChildrenFlatList(item) {
        function getItems(i) {
            return i.items || i.item || [];
        }

        let list = [];
        for (const child of getItems(item)) {
            list.push(child);
            if (getItems(child).length > 0) {
                let childrens = this.getChildrenFlatList(child);
                for (const c of childrens) {
                    list.push(c);
                }
            }
        }
        return list;
    }

    getComponentData(component) {
        let item = this.findByComponent(component);
        return this.getComponentDataByItem(item);
    }

    getComponentDataByItem(item) {
        function getItems(i) {
            return i.items || i.item || [];
        }

        let aplData;
        let parentChains = [];
        if (item.parent) {
            aplData = this.getAplDocumentLastParentItems(item);
            parentChains = this.getParentChain(item);
        } else {
            aplData = this.aplDocument.document.mainTemplate.items;
        }
        let itemAPLData = getItems(aplData)[item.index];
        return {
            item,
            chains: parentChains,
            aplData: {
                parent: aplData,
                item: itemAPLData,
            },
        }
    }

    getAplDocumentLastParentItems(item) {
        let chains = this.getParentChain(item);
        return this.getAPlDocumentLastChain(chains, this.aplDocument.document.mainTemplate.items);
    }

    getParentChain(item) {
        let chain = [];
        let parent = item.parent;
        if (parent) {
            chain.push(parent);
            if (parent.parent) {
                let chains = this.getParentChain(parent);
                for (const chainCur of chains) {
                    chain.push(chainCur);
                }
            }
        }
        return chain.sort((a, b) => {
            if (a.level > b.level) {
                return 1;
            } else if (a.level < b.level) {
                return -1;
            }
            return 0;
        });
    }

    getAPlDocumentLastChain(chains, items) {
        let childItems = items[chains[0].index];
        if (chains.length === 1) {
            return childItems;
        }
        chains.splice(0, 1);

        let nextItems = childItems.items || childItems.item;
        return this.getAPlDocumentLastChain(chains, nextItems);
    }

    findTouchWrappers(items) {
        let found = [];
        for (const item of items) {
            if (item.component.getAPLType() === 'APLTouchWrapper') {
                found.push(item);
            }
        }
        return found;
    }

    isOnSameLevel(item, item2) {
        if (item.parent && !item2.parent) {
            return false;
        }
        if (!item.parent && item2.parent) {
            return false;
        }
        if (!item.parent && !item2.parent) {
            return true;
        }
        return item.parent.level === item2.parent.level && item.parent.index === item2.parent.index;
    }

    moveAPLDataToParent(parent, move, component, index = -1) {
        let parentAplData = parent.aplData.item;
        if (parentAplData.item) {
            parentAplData.items = [parentAplData.item];
            delete parentAplData.item;
        } else if (!parentAplData.items) {
            parentAplData.items = [];
        }
        let aplData = JSON.parse(JSON.stringify(move.aplData.item));
        delete aplData.items;
        delete aplData.item;
        if (index !== -1) {
            parentAplData.items.splice(index, 0, aplData);
            console.log('ITEMS', parentAplData, parentAplData.items);
        } else {
            parentAplData.items.push(aplData);
        }
        this.addByComponent(component, parent.item.component, index);
    }
}