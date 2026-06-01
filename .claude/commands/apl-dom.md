# APLDom

Describe the APLDom virtual DOM tree based on the following analysis.

## Overview

`APLDom` (`custom/APL/APLDom.js`) maintains a virtual tree structure that mirrors the APL component hierarchy. It bridges the visual DOM (Web Components in the page) and the APL document JSON data structure. Used for tree traversal, parent-child lookups, component moves, and syncing DOM state back to APL JSON.

## Data Structure

Each node in the tree:
```js
{
  component,    // reference to the APLComponent instance
  guid,         // component GUID
  index,        // position among siblings
  level,        // depth in tree (0 = root)
  parent,       // reference to parent node (or undefined)
  items: [],    // child nodes
}
```

## Key Methods

### Tree Operations
- `addByComponent(component, parentComponent, index)` - adds a component to the tree under a parent
- `removeByGuid(guid)` - removes a node and re-indexes siblings
- `findByGuid(guid, items)` - recursive search by GUID
- `findByComponent(component)` - search by component reference
- `refreshIndexes(items)` - re-numbers sibling indices after add/remove

### Tree Traversal
- `getChildrenFlatList(item)` - flattens all descendants into a list
- `getParentChain(item)` - returns all ancestors sorted by level (root first)
- `isOnSameLevel(item, item2)` - checks if two items share the same parent
- `findTouchWrappers(items)` - filters items to only TouchWrapper types

### APL Data Synchronization
- `getComponentData(component)` - returns the component's position in the APL JSON tree:
  - `item` - the DOM tree node
  - `chains` - parent chain
  - `aplData.parent` - parent's APL JSON object
  - `aplData.item` - this component's APL JSON object
- `getAplDocumentLastParentItems(item)` - walks the parent chain to find the deepest APL JSON parent
- `getAPlDocumentLastChain(chains, items)` - recursively navigates APL JSON by chain indices

### Move Operations
- `move(oldComponent, toParentComponent)` - generates move instructions:
  - `moveTo` - target parent's data
  - `remove` - source component's data
- `moveAPLDataToParent(parent, move, component, index)` - executes the APL JSON move:
  - Normalizes `item` (single child) to `items` (array) on the parent
  - Copies component's APL data (without children) to the new parent
  - Calls `addByComponent` to update the virtual tree

## Pros
- Clean tree abstraction decouples component hierarchy from DOM structure
- APL JSON synchronization ensures the document data stays consistent with visual state
- Parent chain traversal enables deep nesting operations
- Index management keeps sibling order correct
- `moveAPLDataToParent` handles the APL `item` vs `items` normalization (single vs. multi-child)

## Cons
- `findByGuid` is O(n) recursive search - no hash index for fast lookups
- Tree structure duplicates information that exists in the DOM (parent-child relationships)
- No batch operations - adding N children requires N separate `addByComponent` calls
- `getChildrenFlatList` has inconsistency: checks both `item.items` and `item.item` properties
- No tree validation or consistency checks

## Issues
- None currently tracked
