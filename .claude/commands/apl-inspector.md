# APL Inspector Extensions

Describe the APL-specific inspector components based on the following analysis.

## Overview

The APL Inspector extensions (`custom/APL/ObjectInspector/`) extend the generic Object Inspector with APL-specific behavior: a tree-based component selector (instead of a flat dropdown), APL event/command editing, and a JSON data editor.

## Components

### APLObjectInspectorObjectsComponent (`apl-object-inspector-objects-component`)
Extends `BestAppsObjectInspectorObjectsComponent`. Replaces the `<select>` dropdown with a custom div-based tree selector.

**Features:**
- Tree-indented component list (indentation = 15px * parent depth)
- Dropdown opens/closes on click (absolute positioned, 500px wide, 300px tall)
- Component drag-and-drop reordering within the tree
- Auto-scrolls to selected component
- Persists last selected component name in `localStorage`
- Renames components live when name changes in Properties tab
- Rebuilds tree after component moves via `EVENT_MOVED` subscription
- Click outside the inspector closes the dropdown

**Drag-and-drop in tree:**
- Options are draggable (except the root APLContainer1)
- Drag data format: `OPTION::<guid>`
- Drop triggers `APLDom.move()` -> `APLFactory.cloneByDomItemsMove()`

### APLObjectInspectorEventsTabComponent (`apl-object-inspector-events-tab-component`)
Extends `BestAppsObjectInspectorPropertiesTabComponent`. Overrides `getClassByProperty()` to use `APLObjectInspectorPropertyCommandComponent` for `commands` type properties. Implements `onCommandOpen()` to close other command editors when one opens.

### APLObjectInspectorDataTabComponent (`apl-object-inspector-data-tab-component`)
Extends `BestAppsObjectInspectorPropertiesTabComponent`. Embeds a JSONEditor (third-party library) for raw JSON editing of component APL data. Returns `undefined` from `getClassByProperty()` to prevent normal property rendering. Includes the full JSONEditor CSS (~2000 lines) in its `getStyle()` method. Fires `EVENT_TAB_JSON_CHANGED` on any JSON edit.

### APLObjectInspectorPropertyCommandComponent (`apl-object-inspector-property-command-component`)
Extends `BestAppsObjectInspectorPropertyComponent`. Renders a list of APL commands (SendEvent, SetValue) for an event property. Supports:
- Viewing existing commands as clickable items
- Adding new commands via `[+]` button
- Removing commands via `[-]` with confirm dialog
- Editing commands in a popup `APLCommandPropertiesComponent`
- Command type switching (SendEvent <-> SetValue)
- CRUD events: `EVENT_COMMAND_EVENT_ADDED`, `EVENT_COMMAND_EVENT_SAVED`, `EVENT_COMMAND_EVENT_REMOVED`

### APLCommandPropertiesComponent (`apl-command-properties-component`)
Extends `BestAppsObjectInspectorPropertiesTabComponent`. Popup editor for a single command. Shows:
- Command type selector (SendEvent, SetValue)
- Property editors for command fields
- CLOSE and SAVE action buttons
Fires `EVENT_ACTION_CLOSE` and `EVENT_ACTION_SAVE` events.

## Pros
- Tree selector provides hierarchical view matching APL document structure
- Drag-and-drop in the tree enables visual component reordering
- JSONEditor integration gives power users raw JSON access
- Command editor handles the full CRUD lifecycle
- `localStorage` persistence remembers last selection across page reloads

## Cons
- `APLObjectInspectorDataTabComponent` embeds ~2000 lines of JSONEditor CSS in `getStyle()` - should use `adoptedStyleSheets` or external CSS
- Tree selector hardcodes `APLContainer1` as non-draggable root
- Click-outside handler uses `mousedown` on `window` - may interfere with other interactions
- Command properties popup uses absolute positioning relative to viewport - may go off-screen
- `EVENT_MOVED` handler uses `subscribeOnce` but checks `component.moved` flag - redundant guard
- JSONEditor icons use hardcoded relative paths to `./custom/APL/vendor/jsoneditor/img/` which won't work in the shadow DOM

## Issues
- None currently tracked
