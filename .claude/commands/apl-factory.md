# APLFactory

Describe the APLFactory based on the following analysis.

## Overview

`APLFactory` (`custom/APL/APLFactory.js`) is the central component creation and interaction engine. It manages the component lifecycle: creation from palette, cloning for moves, drag-and-drop handling, component selection, and initialization. It holds references to the palette, screen, inspector, and DOM tree.

## Key Responsibilities

### Component Creation
- `create(className, container)` - creates a root component (used for APLDocumentComponent)
- `copy(component, container)` - copies a palette component into a container
- `copyFromTag(tag, type, container, data)` - core creation method: creates element, sets identity, wires events, appends to container, waits for render
- `clone(component, parent)` - clones an existing component to a new parent

### Drag and Drop
- `dragStartHandler(ev, el)` - sets drag data with component ID (format: `APL::<guid>`)
- `dragoverHandler(ev)` - sets `dropEffect: "copy"`
- `dropHandler(ev, component)` - handles drops on the document canvas
- `dropAPLHandler(ev, el)` - handles drops on components:
  - From palette: copies component
  - From APL tree: re-parents component via `setAPLParent()`
  - Distinguishes by prefix: `Palette::` vs `APL::`
- `processElementAction(ev, el, callback)` - determines if a click/drag should propagate or be captured (TouchWrapper, Text, Image capture; others check parent chain for TouchWrappers)

### Component Moving
- `cloneByDomItemsMove(remove, moveTo)` - recursive method that:
  1. Clones the component and its children to the new parent
  2. Updates APL data in the DOM tree
  3. Removes old components
  4. Fires `EVENT_MOVED` to refresh the inspector
  5. Handles same-level moves with index tracking

### Component Initialization
- `initComponent(component)` - called after render:
  - Sets `draggable="true"`
  - Injects visual content based on type (Image gets `<img>`, Text gets `<div>`, others get name label)
  - Selects the newly created component

### Component Lookup
- `getItemByAPLName(name)` - find by APL display name
- `getItemByGuid(guid)` - find by GUID
- `getNextAPLNumber(type)` - auto-increment numbering per type

## Pros
- Centralized creation ensures consistent component setup
- Drag-and-drop handles both palette-to-canvas and canvas-to-canvas moves
- `processElementAction` intelligently determines click targets in nested TouchWrappers
- Clone-and-remove pattern for moves preserves component data integrity
- Auto-numbering provides unique names per type

## Cons
- XSS vulnerability in `initComponent()`: `data.source` and `data.text` are injected via innerHTML without sanitization
- `cloneByDomItemsMove()` is deeply recursive and complex (~60 lines) with multiple side effects
- `onSelect` is set as a property callback, not an event - only supports one listener
- All items stored in a flat array - no index for fast GUID or name lookup
- `dropHandler` only handles drops on Document, not on arbitrary parents
- Hardcoded type checks: `['APLTouchWrapper', 'APLText', 'APLImage'].includes(...)` should be a component method

## Issues
- **Hardcoded component names**: `initComponent()` and `processElementAction()` hardcode APL type strings for dispatch logic instead of using component methods/interfaces
- **Memory leak potential**: Components are added to `items` array but never removed (even after moves, old items remain since `cloneByDomItemsMove` creates new items but doesn't remove from the factory's items array)
