# APLProperties & APLEvents

Describe the APLProperties and APLEvents utility classes based on the following analysis.

## Overview

**APLProperties** (`custom/APL/APLProperties.js`) is a static utility class that handles encoding (writing) and decoding (reading) APL component properties. It converts between APL data format and CSS styles, and provides shared property definitions for positioning and containers.

**APLEvents** (`custom/APL/APLEvents.js`) is a parallel static utility class that handles encoding and decoding APL event data (commands attached to events like `onPress`).

## APLProperties

### `encode(component, key, value)`
Writes a property value to both APL data and CSS:
1. Looks up the property definition from `component.getAPLProperties()`
2. Stores the value in `component.getAPLData()` under the APL key
3. If `options.css` is defined, applies the value to CSS:
   - `dimension` type: converts dp values via `screen.getSizePixels()`
   - `list` type: maps APL values to CSS values using the items array
   - `css: true` -> uses property key as CSS property name
   - `css: 'name'` -> uses the specified CSS property name
   - `css: ['a', 'b']` -> applies to multiple CSS properties
   - `options.wrapper` -> applies to wrapper element instead of host
4. Calls `properties.onCSSSet()` if defined (for post-processing)

### `decode(properties, data, component)` / `decodeByComponent(component)`
Reads property values from APL data for the inspector:
1. Iterates all properties (skipping `onCSSSet`)
2. Resolves value from: APL data by key -> getter method -> default
3. Deep-clones property definition and attaches resolved value
4. Returns a properties object ready for the inspector

### Shared Property Definitions
- `getAlignmentAndPositioningProperties()` - `left`, `top`, `right`, `bottom` (dimension)
- `getContainerProperties()` - `position` (list: relative, absolute, sticky)

## APLEvents

### `encode(component, key, value)`
Stores event data in `component.getAPLData()[key]`

### `decode(component)`
Reads all event definitions from `component.getAPLEvents()`, resolves values from APL data, returns for inspector display.

## Pros
- Declarative property-to-CSS mapping eliminates manual style management
- `encode` handles dp conversion, list value mapping, and multi-property expansion automatically
- Shared property definitions (`getContainerProperties`, `getAlignmentAndPositioningProperties`) reduce duplication
- `decode` generates inspector-ready data with resolved values and defaults
- Clean symmetry between encode (write) and decode (read)

## Cons
- `encode`'s `setStyle` is a closure with multiple concerns (dp conversion, list mapping, wrapper targeting) - complex inner function
- `decode` uses `JSON.parse(JSON.stringify(property))` for deep clone - breaks functions and special types
- `getContainerProperties` returns `position` with `sticky` which is not a valid APL position value
- `encode` doesn't validate property values against type constraints
- No batch encode/decode - each property encoded individually (fine for single changes, inefficient for bulk)
- APLEvents.encode is nearly unused - events are managed through the command system instead

## Issues
- **`onCSSSet` iteration guard**: Both `encode` (calls `properties.onCSSSet()`) and `decode` (skips `key === 'onCSSSet'`) have special handling for the function property mixed into the properties object. This is fragile - if the key name changes, both would break
