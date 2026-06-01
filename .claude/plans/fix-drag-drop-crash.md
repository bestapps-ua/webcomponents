# Plan: Fix Drag-and-Drop Crash in Inspector Tree

## Bug

When dragging a component option in the inspector's select-container tree, the app crashes:
```
APLDom.js:84 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'guid')
```

**Line 84:** `findByComponent(component) { return this.findByGuid(component.guid); }`

The `component` argument is `undefined`, meaning `getComponentData()` was called with an undefined value from `move()`.

## Root Cause Chain

`APLObjectInspectorObjectsComponent.optionDropHandler()`:
```js
let from = window.apl.aplDom.findByGuid(type.dragId);   // could be undefined
let to = window.apl.aplDom.findByGuid(option.getAttribute('value'));  // could be undefined
let mv = window.apl.aplDom.move(from, to);  // passes undefined to move()
```

`APLDom.move()`:
```js
move(oldComponent, toParentComponent) {
    let moveTo = this.getComponentData(toParentComponent);  // calls findByComponent(undefined)
```

`findByGuid` returns `undefined` when the guid is not found in the tree. No null check before calling `move()`.

## Fixes (3 items)

### Fix 1: Guard `optionDropHandler` against missing tree items

**File:** `custom/APL/ObjectInspector/APLObjectInspectorObjectsComponent.js:360-364`
**Fix:** Check `from` and `to` before calling `move()`.

### Fix 2: Guard `APLDom.move()` against undefined arguments

**File:** `custom/APL/APLDom.js:98`
**Fix:** Early return if either argument is undefined.

### Fix 3: Guard `APLDom.getComponentData()` against undefined

**File:** `custom/APL/APLDom.js:126`
**Fix:** Return null if component is undefined or not found.

### Fix 4: Guard `cloneByDomItemsMove()` against null move data

**File:** `custom/APL/APLFactory.js:209`
**Fix:** Early return if remove or moveTo is null.

## Workflow
1. Fix → 2. Test → 3. Skill → 4. Progress → 5. Commit
