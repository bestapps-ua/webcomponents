# APL Orchestrator

Describe the `APL` orchestrator class based on the following analysis.

## Overview

`APL` (`custom/APL/APL.js`) is the main entry point and orchestrator for the APL visual editor. It wires together all subsystems: screen management, component palette, factory, DOM tree, loader, inspector, and property adaptor. It is instantiated once in `index.html` as `window.apl`.

## Responsibilities

1. **Vendor loading** - dynamically loads third-party JS/CSS (treeselectjs, jsoneditor) via script/link tag injection
2. **System initialization** - creates and connects all major subsystems in sequence
3. **Event routing** - subscribes to `EVENT_PARENT_CHANGED` to handle component re-parenting (drag-drop moves)
4. **Tab synchronization** - `updateTabs()` propagates property changes to all inspector tabs
5. **Visual rendering** - `viewComponent()` applies APL properties as CSS via `APLProperties.encode()`
6. **Property adaptor callbacks** - handles component selection, tab changes, and events/commands editing

## Init Flow

```
constructor() -> initVendors() -> init()
init():
  1. Create APLScreen with Echo Show 2 device
  2. Create APLScreenComponent (device/resolution selector)
  3. Create APLPalette (component palette sidebar)
  4. Create APLFactory (component creation engine)
  5. Subscribe to resolution changes -> resize all components
  6. Create APLDocumentComponent (main canvas)
  7. Create APLLoader (load schema from home.js)
  8. Create APLDom (virtual tree)
  9. Create BestAppsObjectInspectorComponent (property inspector)
  10. Create BestAppsPropertyAdaptor (bridges inspector <-> components)
  11. Wire up callbacks: onComponentChange, onTabChange, onComponentLoad, onSelect
  12. Load schema and render
```

## Event Handling

The `onTabChange` callback handles three tab types:
- **Properties tab** - encodes property changes to CSS via `APLProperties.encode()`
- **Events tab** - manages command CRUD (add/remove/save) on APL events like `onPress`
- **Data tab** - handles raw JSON editing via jsoneditor, applies full JSON updates

## Pros
- Single orchestrator creates clear initialization flow
- Clean separation - APL class only wires things together, doesn't own rendering logic
- Vendor loading is generic and extensible (just add to the array)
- Resolution change handler correctly re-applies all properties at new dp scale

## Cons
- Everything stored as `window.apl`, `window.aplFactory`, `window.aplDom` globals - tight coupling, not testable
- `onTabChange` callback contains complex event-type switching with nested cases - should be decomposed
- No error recovery if vendor loading fails (console.log only)
- `init()` is a ~100-line async method that does too many things
- No cleanup/destroy mechanism

## Issues
- **Global coupling**: Direct references to `window.apl`, `window.aplFactory`, `window.aplDom` throughout the codebase make components untestable in isolation
- **Missing null checks**: `onTabChange` accesses `source.data.data.command` chains without null guards
