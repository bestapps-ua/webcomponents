# APLLoader

Describe the APLLoader based on the following analysis.

## Overview

`APLLoader` (`custom/APL/APLLoader.js`) loads APL JSON schema files and recursively instantiates the component tree. It also serves as the bridge between components and the inspector by generating tab configurations (Properties, Events, Data) for any selected component.

## Key Responsibilities

### Schema Loading
- `load()` -> `getLocalJSON(path)` - loads a JS file that defines a global `scheme` variable
- The schema file (e.g., `Schemas/home.js`) is loaded as a `<script>` tag, not fetched as JSON
- On load, sets the schema on `APLDom` and calls `loadComponents()`

### Component Tree Creation
- `createComponents(items, container)` - recursively processes the APL JSON `items` array
- Maps APL types to component classes via switch statement:
  - `Container` -> `APLContainerComponent`
  - `Frame` -> `APLFrameComponent`
  - `Image` -> `APLImageComponent`
  - `Text` -> `APLTextComponent`
  - `TouchWrapper` -> `APLTouchWrapperComponent`
- For each item: creates via factory, sets parent, applies properties, registers in DOM tree
- Handles both `items` (array of children) and `item` (single child) formats

### Inspector Tab Generation
- `getTabs(component)` returns three tab configs:
  1. **Properties** - `APLProperties.decodeByComponent(component)` -> `BestAppsObjectInspectorPropertiesTabComponent`
  2. **Events** - `APLEvents.decode(component)` -> `APLObjectInspectorEventsTabComponent`
  3. **Data** - raw `component.getAPLData()` -> `APLObjectInspectorDataTabComponent`

### Refresh
- `refresh()` - clears the container and reloads all components from the schema

## Pros
- Clean recursive tree builder handles arbitrary nesting depth
- Tab generation system is extensible - easy to add new inspector tabs
- Handles both `items` (multi-child) and `item` (single-child) APL formats
- Properties are applied during loading so components render correctly immediately
- `refresh()` enables full tree rebuilds

## Cons
- Schema loaded via script tag injection, not `fetch()` - relies on global `scheme` variable, not modular
- Type-to-class mapping is a hardcoded switch statement - must be updated for each new component type
- No support for APL Sequence, Pager, VectorGraphic, Video, or GridSequence types
- Unknown types are silently skipped with `console.warn` - no user-facing error
- No validation of schema structure
## Issues
- None currently tracked
