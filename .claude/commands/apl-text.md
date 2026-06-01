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
| `color` | text | `color` | Text color |
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

The text content is injected by `APLFactory.initComponent()`:
```js
component.element.wrapper.innerHTML = `<div>${data.text}</div>`;
```

## Pros
- Merges position and alignment properties for absolute positioning support
- `fontSize` as dimension type gets automatic dp conversion via the property system
- Custom `auto` height handling adapts text to its font size

## Cons
- Many typography properties have no CSS mapping: `fontStyle`, `letterSpacing`, `lineHeight`, `maxLines`, `textAlign`, `textAlignVertical` - these are defined but don't actually affect rendering
- `color` typed as `text` instead of `color` - won't get a color picker in the inspector
- Text content set externally by factory via textContent, not by the component
- `auto` height calculation assumes single-line text (uses fontSize as height)
- No rich text / HTML rendering support (APL supports limited HTML in text)

## Issues
- **Dead CSS properties**: Over half the typography properties are defined but never mapped to CSS
