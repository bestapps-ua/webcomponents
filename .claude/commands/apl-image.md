# APLImageComponent

Describe the APLImageComponent based on the following analysis.

## Overview

`APLImageComponent` (`custom/APL/APLImageComponent.js`) represents the APL Image component. It extends `APLComponent` and adds image-specific properties like `source`, `scale`, `align`, and `borderRadius`. The actual `<img>` element is created by `APLFactory.initComponent()`, not by the component itself.

## Tag: `<apl-image-component>`

## APL Reference
https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-image.html

## Additional Properties (beyond APLComponent base)

| Property | Type | Default | CSS Mapping | Notes |
|---|---|---|---|---|
| `align` | text | - | `align` | Image alignment |
| `borderRadius` | text | - | `borderRadius` | Corner rounding |
| `source` | text | - | - | Image URL |
| `sources` | text | - | - | Array of sources (stored as text) |
| `scale` | list | `best-fit` | - (custom) | fill, best-fill, best-fit, best-fit-down, none. Uses `visual: 'scale-picker'` for SVG icon picker in inspector |

## Custom `onCSSSet` Logic

Maps APL `scale` values to CSS `object-fit` on the inner `<img>` element:
- `fill` -> `object-fit: fill`
- `best-fill` -> `object-fit: cover`
- `best-fit` -> `object-fit: contain`
- `best-fit-down` -> `object-fit: scale-down`
- `none` -> `object-fit: none`

## Image Rendering

The `<img>` element is NOT created by this component. Instead, `APLFactory.initComponent()` checks the APL type and injects:
```js
component.element.wrapper.innerHTML = `<img src="${data.source}" alt="" />`;
```

## Pros
- APL scale-to-CSS object-fit mapping is correct and complete
- List-type `scale` property provides dropdown in inspector
- Chains `onCSSSet` with parent properly

## Cons
- Image element created externally by factory, not by the component - violates encapsulation
- `sources` property is typed as `text` but APL expects an array of source objects
- `borderRadius` typed as `text` instead of `dimension` - won't get dp conversion
- No `overlayColor`, `overlayGradient`, or `filter` properties (APL features)
- No loading/error states for images
- `align` maps to CSS `align` which is not a standard CSS property (should map to `object-position` or similar)

## Issues
- None currently tracked
