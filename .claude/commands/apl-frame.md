# APLFrameComponent

Describe the APLFrameComponent based on the following analysis.

## Overview

`APLFrameComponent` (`custom/APL/APLFrameComponent.js`) represents the APL Frame component - a single-child container with visual styling (background, border, border-radius). It extends `APLComponent` directly and adds color/border properties with a custom `onCSSSet` handler for border rendering.

## Tag: `<apl-frame-component>`

## APL Reference
https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-frame.html

## Additional Properties (beyond APLComponent base)

| Property | Type | CSS Mapping | Notes |
|---|---|---|---|
| `background` | color | `background` | Background shorthand |
| `backgroundColor` | color | `backgroundColor` | Explicit background color |
| `borderColor` | color | `borderColor` | Border color |
| `borderRadius` | dimension | `borderRadius` | Corner rounding |
| `borderWidth` | dimension | - (custom) | Handled in `onCSSSet` |
| `position` | list | `position` | From `getContainerProperties()`: relative, absolute |
| `left/top/right/bottom` | dimension | - | From `getAlignmentAndPositioningProperties()` |

## Custom `onCSSSet` Logic

The `onCSSSet` callback chains with the parent's `onCSSSet` and then:
- Checks if `borderWidth` is a plain number (e.g., `"2"` equals `parseFloat("2")`)
- If so, appends `px` and sets `borderStyle` to `solid`

## Pros
- Clean extension of base APLComponent with frame-specific styling
- Chains `onCSSSet` callbacks properly (calls parent first, then adds own logic)
- Merges position and alignment properties from static helpers
- Color-type properties enable color picker in the inspector

## Cons
- `borderWidth` handling is fragile - only recognizes plain numeric strings, not values with units
- No support for per-corner border radius (APL supports `borderBottomLeftRadius`, etc.)
- `borderStyle` is hardcoded to `solid` - no dashed/dotted option
- The `onCSSSet` chaining pattern (save reference, create new function, call old) is repeated in every subcomponent - could be a base class pattern

## Issues
- None currently tracked
