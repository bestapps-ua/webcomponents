# APLTextComponent

Describe the APLTextComponent based on the following analysis.

## Overview

`APLTextComponent` (`custom/APL/APLTextComponent.js`) represents the APL Text component for displaying styled text. It extends `APLComponent` and adds typography properties (font, color, alignment) with custom height calculation for `auto`-height text.

## Tag: `<apl-text-component>`

## APL Reference
https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-text.html

## Additional Properties (beyond APLComponent base)

| Property | Type | CSS Mapping | Notes |
|---|---|---|---|
| `color` | color | `color` | Text color |
| `fontFamily` | text | `fontFamily` | Font family |
| `fontSize` | dimension | `fontSize` | Font size with dp support |
| `fontStyle` | text | - | italic/normal (no CSS mapping) |
| `fontWeight` | text | `fontWeight` | bold/normal/100-900 |
| `letterSpacing` | text | - | No CSS mapping |
| `lineHeight` | dimension | - | No CSS mapping |
| `maxLines` | text | - | No CSS mapping |
| `text` | text | - | The actual text content |
| `textAlign` | text | - | No CSS mapping |
| `textAlignVertical` | text | - | No CSS mapping |
| `position` | list | `position` | From `getContainerProperties()` |
| `left/top/right/bottom` | dimension | - | From `getAlignmentAndPositioningProperties()` |

## Custom `onCSSSet` Logic

Handles `height: auto` by:
1. Getting `fontSize` from APL data
2. Converting dp to pixels using `screen.getDPSize()`
3. Setting the inner `<div>` height and host `maxHeight` to the computed font size

## Text Rendering

The component's `renderContent()` method creates a `<div>` with `textContent` and uses `replaceChildren()` — safe from XSS.

## Pros
- Merges position and alignment properties for absolute positioning support
- `fontSize` as dimension type gets automatic dp conversion via the property system
- Custom `auto` height handling adapts text to its font size

## Cons
- Many typography properties have no CSS mapping (Feature Gap): `fontStyle`, `letterSpacing`, `lineHeight`, `maxLines`, `textAlign`, `textAlignVertical` - these are defined but don't actually affect rendering
- `auto` height calculation assumes single-line text (uses fontSize as height)
- No rich text / HTML rendering support (Feature Gap: APL supports limited HTML in text)

## Issues
- None currently tracked
