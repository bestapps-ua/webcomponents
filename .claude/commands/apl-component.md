# APLComponent

Describe the `APLComponent` base class based on the following analysis.

## Overview

`APLComponent` (`custom/APL/APLComponent.js`) extends `BestAppsComponent` and serves as the base class for all APL visual components (Container, Frame, Image, Text, TouchWrapper, etc.). It adds APL-specific identity (name, type, number), a declarative property system with CSS mapping, parent-child relationships, and factory integration.

## Tag: `<apl-component>`

## Key Features

### APL Identity
- `APLName` - display name (e.g., "APLContainer1")
- `APLType` - component type (e.g., "APLContainer")
- `APLNumber` - auto-incremented number per type
- `APLData` - raw APL JSON data object
- `APLParent` - reference to parent APLComponent

### Declarative Property System
`APLProperties` defines component properties with:
- `type` - property type: `text`, `dimension`, `color`, `list`
- `default` - default value
- `options.css` - CSS property mapping (true = same name, string = different name, array = multiple CSS props)
- `options.apl` - APL JSON key mapping
- `options.wrapper` - apply CSS to wrapper div instead of host
- `options.property` - map to getter method
- `onCSSSet` - callback after all CSS is applied (for computed styles)

### Base Properties
- `name` (maps to APL `id`)
- `height`, `minHeight`, `maxHeight` (dimension, maps to CSS)
- `width`, `minWidth`, `maxWidth` (dimension, maps to CSS)
- `padding`, `paddingLeft/Top/Right/Bottom` (dimension, maps to CSS)
- `onCSSSet` handles absolute positioning with dp conversion

### Parent-Child Management
- `setAPLParent()` fires `EVENT_PARENT_SET` and `EVENT_PARENT_CHANGED` (when re-parented)
- `items` array tracks child component GUIDs
- `addItem()` / `removeItem()` manage the child list

## Events
| Event | When |
|---|---|
| `EVENT_PARENT_SET` | Parent assigned |
| `EVENT_PARENT_CHANGED` | Parent changed (re-parenting) |
| `EVENT_MOVED` | Component moved in tree |

## Styles
- Host: `box-sizing: border-box`, white background, `flex: 1 0`
- Selected state: red solid border on host, red dashed border on wrapper
- Wrapper: full width/height, `inline-flex`, column direction, overflow hidden

## Pros
- Declarative property system is powerful - define properties once, get CSS mapping, APL serialization, and inspector UI for free
- Clean parent-child tracking enables tree operations
- `onCSSSet` callback allows computed style logic after property application
- Separation of `APLData` (raw JSON) from `APLProperties` (schema) is well-designed
- Event-driven re-parenting supports drag-and-drop moves

## Cons
- `APLProperties` object contains `onCSSSet` as a function property alongside data properties - mixing concerns and causing issues in iteration (must skip `onCSSSet` key)
- `onCSSSet` in the base class references `this` but is defined as an arrow function inside the property object literal - `this` binds to the outer scope during class body evaluation, not to the component instance
- `items` array is a public instance field initialized to `[]` in the class body - all instances share the same pattern but not the same array (correct)
- No validation that APLParent is actually a valid parent type
- Re-parenting fires a global event via `window.apl.publish()` - tightly coupled to the global APL instance

## Issues
- None currently tracked

## Architecture Notes
- `onCSSSet` arrow function in APLProperties field initializer correctly captures `this` as the component instance (class field initializers run in constructor context)
- `setAPLParent()` dispatches `EVENT_PARENT_CHANGED` via `window.apl.publish()` — this is intentional because re-parenting events must reach the global APL orchestrator; routing through the component's own pub/sub would require passing the APL instance reference, which is equivalent coupling
