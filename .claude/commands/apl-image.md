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
| `borderRadius` | dimension | - | `borderRadius` | Corner rounding with dp support |
| `source` | text | - | - | Image URL |
| `sources` | text | - | - | Array of sources (stored as text) |
| `scale` | list | `best-fit` | - (custom) | fill, best-fill, best-fit, best-fit-down, none. Uses `visual: 'scale-picker'` for SVG icon picker in inspector |

## Custom `onCSSSet` Logic

Chains with parent `onCSSSet`, then applies scale-based SVG sizing. The `_applyScale()` method computes SVG width/height/position based on APL scale values and wrapper dimensions.

## Image Rendering

The component's `renderContent()` method creates an SVG with an `<image>` element using safe DOM APIs (`createElementNS`, `setAttribute`). A probe `Image` object loads the source to get natural dimensions for scale calculations.

## Pros
- APL scale-to-CSS object-fit mapping is correct and complete
- List-type `scale` property provides dropdown in inspector
- Chains `onCSSSet` with parent properly

## Cons
- `sources` property is typed as `text` but APL expects an array of source objects
- No `overlayColor`, `overlayGradient`, or `filter` properties (Feature Gap)
- No loading/error states for images
- `align` maps to CSS `align` which is not a standard CSS property (should map to `object-position` or similar)

## Issues
- None currently tracked
