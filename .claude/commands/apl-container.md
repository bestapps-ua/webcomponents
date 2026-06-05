# APLContainerComponent

Describe the APLContainerComponent and APLMultiChildComponent based on the following analysis.

## Overview

`APLContainerComponent` (`custom/APL/APLContainerComponent.js`) represents the APL Container layout component - a flexbox-based parent that arranges child components in rows or columns. It extends `APLMultiChildComponent`, which is a thin marker class extending `APLComponent`.

`APLMultiChildComponent` (`custom/APL/APLMultiChildComponent.js`) is a near-empty intermediate class that exists to semantically mark components that can contain multiple children. Currently adds nothing beyond `APLComponent`.

## Tags
- `<apl-container-component>` (APLContainerComponent)
- `<apl-multi-child-component>` (APLMultiChildComponent)

## APL Reference
https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-container.html

## Additional Properties (beyond APLComponent base)

| Property | Type | Default | CSS Mapping | Notes |
|---|---|---|---|---|
| `alignItems` | list | `stretch` | `alignItems` (wrapper) | stretch, center, start, end, baseline |
| `direction` | list | `column` | `flexDirection` (wrapper) | column, row, column-reverse, row-reverse |
| `wrap` | list | `noWrap` | `flexWrap` (wrapper) | noWrap, wrap, wrapReverse |
| `justifyContent` | list | `start` | `justifyContent` (wrapper) | start, end, center, space-between, space-around, space-evenly |
| `shadowColor` | color | - | - | Not yet CSS-mapped |

## Pros
- Maps APL layout properties directly to CSS flexbox - natural fit
- `wrapper: true` option correctly applies flex properties to the inner wrapper div
- List-type properties provide valid value sets for the inspector dropdown
- Object syntax for list items (e.g., `{'column-reverse': 'columnReverse'}`) handles APL-to-CSS naming differences

## Cons
- `APLMultiChildComponent` is effectively empty - adds no behavior, just semantic typing. Could be removed or turned into a mixin
- `shadowColor` property is defined but has no CSS mapping or implementation
- No support for `numbered` children (APL feature for numbered items in container)

## Issues
- None currently tracked
