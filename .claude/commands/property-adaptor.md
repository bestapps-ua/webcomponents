# BestAppsPropertyAdaptor

Describe the BestAppsPropertyAdaptor based on the following analysis.

## Overview

`BestAppsPropertyAdaptor` (`custom/ObjectInspector/BestAppsPropertyAdaptor.js`) is a mediator class (not a Web Component) that bridges the selected component and the Object Inspector UI. It handles bidirectional data flow: when the user selects a component, properties flow to the inspector; when the user edits a property in the inspector, changes flow back to the component.

## Key Responsibilities

1. **Component selection routing** - when a component is selected (in the inspector dropdown or by clicking on canvas), updates the inspector with the component's tabs
2. **Property change routing** - when a property is edited in the inspector, fires `onTabChange` callback
3. **Component load notification** - when a new component is first set, fires `onComponentLoad` callback
4. **Property synchronization** - keeps tab property data in sync when external changes occur

## API

### Constructor
```js
new BestAppsPropertyAdaptor({ inspector, component? })
```

### Callback Hooks (set externally)
- `onComponentChange({component, source})` - fired when user switches component in dropdown
- `onTabChange({tabName, data, source})` - fired when user edits a property/event/data
- `onComponentLoad(component)` - fired when a new component is first selected

### Methods
- `update(component, tabs)` - pushes component+tabs to the inspector, sets as current
- `updateProperties(tab, properties)` - updates specific properties on a tab
- `updateProperty(tab, propertyName, data)` - updates a single property
- `getComponent()` / `getTabs()` - accessors

## Internal Flow

```
Inspector EVENT_CHANGED
  -> onChange(data)
    -> if EVENT_CHANGED_COMPONENT: onComponentChange({component, source})
    -> if EVENT_CHANGED_TAB: onTabChange({tabName, data, source})
```

## Pros
- Clean mediator pattern decouples the inspector UI from component logic
- Callback-based API allows the APL layer to define its own change handling
- `onComponentLoad` enables deferred property rendering (apply CSS after component is displayed in inspector)
- `_syncProperty` keeps tab data in sync without full tab rebuild
- Tab/property lookup methods (`_findTab`, `_findProperty`) enable targeted updates

## Cons
- Callbacks set as instance properties - only one handler per event, no multi-subscriber
- `setComponent()` uses `setTimeout(() => this.onComponentLoad(...), 1)` - fragile timing hack
- Deep internal access: `getTabs()` reaches through `this.getInspector().objectsSelectorComponent.tabsComponent.getTabs()` - Law of Demeter violation
- No error handling if inspector or component is null
- `_syncProperty` mutates tab options directly, which may cause stale references
- No way to unregister callbacks

## Issues
- None currently tracked
