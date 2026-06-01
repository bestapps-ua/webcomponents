# APLScrollViewComponent

Describe the APLScrollViewComponent based on the following analysis.

## Overview

`APLScrollViewComponent` (`custom/APL/APLScrollViewComponent.js`) represents the APL ScrollView component - a scrollable single-child container. It extends `APLActionableComponent` and is currently a minimal stub with no additional properties or behavior.

## Tag: `<apl-scroll-view-component>`

## APL Reference
https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-scrollview.html

## Implementation

The component is only 16 lines. It:
1. Extends `APLActionableComponent` (inherits focus/keyboard events)
2. Overrides `getAPLProperties()` to merge with parent (but adds nothing)
3. That's it - no scroll behavior, no additional properties

## Properties
Inherits all base `APLComponent` properties (width, height, padding, name) and `APLActionableComponent` events (onFocus, onBlur, handleKeyDown, handleKeyUp). Adds nothing of its own.

## Pros
- Placeholder exists in the palette so it can be dragged onto the canvas
- Inherits Actionable events which are correct for ScrollView per APL spec

## Cons
- Missing APL-specific properties: `onScroll` event, `snap` property
- No position/alignment properties merged (unlike Frame, Text, TouchWrapper)

## Issues
- None currently tracked
