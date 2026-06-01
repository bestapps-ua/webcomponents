# Object Inspector

Describe the ObjectInspector component system based on the following analysis.

## Overview

The Object Inspector (`custom/ObjectInspector/`) is a generic, APL-agnostic property editing framework. It provides a component selector dropdown, tabbed panels, and property editors for different data types. The APL layer extends these components with APL-specific behavior.

## Component Hierarchy

```
BestAppsComponent
  BestAppsObjectInspectorComponents (base with component tracking)
    BestAppsObjectInspectorComponent (main inspector)
    BestAppsObjectInspectorObjectsComponent (component selector + tabs)
  BestAppsObjectInspectorTabsComponent (tab container)
  BestAppsObjectInspectorTabComponent (base tab)
    BestAppsObjectInspectorPropertiesTabComponent (properties tab)
      BestAppsObjectInspectorEventsTabComponent (events tab)
  BestAppsObjectInspectorPropertyComponent (base property editor)
    BestAppsObjectInspectorPropertyInputComponent (text input)
    BestAppsObjectInspectorPropertyListComponent (dropdown select)
    BestAppsObjectInspectorPropertyArrayComponent (array editor)
```

## Key Components

### BestAppsObjectInspectorComponent (`ba-object-inspector-component`)
Main container. Creates an objects selector component and forwards events. Manages selected component highlighting (adds/removes `.selected` CSS class). Configurable via options: `nameAttribute`, `typeAttribute`, `uidAttribute`, `objectsSelector` (can swap in APL-specific selector).

### BestAppsObjectInspectorObjectsComponent (`ba-object-inspector-objects-component`)
Renders a `<select>` dropdown of all registered components and a tabs panel. Handles component switching, tab updates, and event queuing (processes events sequentially with 100ms debounce).

### BestAppsObjectInspectorTabsComponent (`ba-object-inspector-tabs-component`)
Generic tab container with tab headers and panel areas. Tabs are shown/hidden via CSS class toggling. Supports dynamic tab updates and `render()` calls on the active panel.

### BestAppsObjectInspectorPropertiesTabComponent (`ba-object-inspector-properties-tab-component`)
Renders property editors based on property type:
- `text`/`color`/`dimension` -> `PropertyInputComponent`
- `list` -> `PropertyListComponent`
- `array` -> `PropertyArrayComponent`

Each property editor fires `EVENT_CHANGED` which bubbles up through the tab system.

### Property Editors

**PropertyInputComponent** - text input with Enter to save, Escape to cancel, blur to save. Activate/deactivate pattern with visual selection state.

**PropertyListComponent** - `<select>` dropdown for enumerated values. Handles both simple strings and `{cssValue: 'aplValue'}` object mapping.

**PropertyArrayComponent** - dynamic list of text inputs with add (`[+]`) and remove (`[-]`) buttons. Remove triggers confirm dialog. Currently has a broken `getFieldValue()` (returns hardcoded `'zzz'`).

## Events Flow

```
PropertyEditor -> EVENT_CHANGED
  -> PropertiesTab.sendPropertyChanged({tabName, key, data})
    -> TabsComponent.sendChanged()
      -> ObjectsComponent.sendChanged()
        -> ObjectInspectorComponent.sendChanged()
          -> PropertyAdaptor.onChange()
```

## Pros
- Fully generic - works with any component type, not just APL
- Property type system automatically selects the right editor widget
- Activate/deactivate pattern ensures only one property is editable at a time
- Tab system is dynamic - tabs can be added/removed at runtime
- CSS variables (`--ba-obji-select-*`) allow external styling
- Event bubbling through the component tree is well-structured

## Cons
- No undo/redo support for property changes
- Tooltip implementation creates DOM elements on `document.body` outside the shadow DOM - leaks into global DOM
- Property activation on click/focus can be confused when multiple properties are rapidly clicked
- No search/filter for properties in large property lists
- Tab panels are all created upfront, not lazy-loaded

## Issues
- **Tooltip DOM leak**: `BestAppsObjectInspectorPropertyComponent.initTooltip()` appends tooltip elements to `document.body`, bypassing shadow DOM encapsulation
