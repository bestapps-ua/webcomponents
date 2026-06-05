# APLTouchWrapperComponent

Describe the APLTouchWrapperComponent and its inheritance chain (APLTouchableComponent, APLActionableComponent) based on the following analysis.

## Overview

`APLTouchWrapperComponent` (`custom/APL/APLTouchWrapperComponent.js`) represents an interactive touch target in APL. It wraps a single child component and handles touch/press events. It sits at the end of an inheritance chain:

```
BestAppsComponent -> APLComponent -> APLActionableComponent -> APLTouchableComponent -> APLTouchWrapperComponent
```

### APLActionableComponent (`custom/APL/APLActionableComponent.js`)
Base for components that respond to focus and keyboard events. Adds APL events:
- `onFocus`, `onBlur`, `handleKeyDown`, `handleKeyUp` (all type: `commands`)

### APLTouchableComponent (`custom/APL/APLTouchableComponent.js`)
Adds touch/gesture APL events:
- `gesture`, `gestures`, `onCancel`, `onDown`, `onMove`, `onPress`, `onUp` (all type: `commands`)

### APLTouchWrapperComponent
The concrete component that wraps a child and adds position/alignment properties with custom size constraints.

## Tags
- `<apl-actionable-component>` (APLActionableComponent - abstract)
- `<apl-touchable-component>` (APLTouchableComponent - abstract)
- `<apl-touch-wrapper-component>` (APLTouchWrapperComponent)

## APL Reference
https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-touchwrapper.html

## Additional Properties
- `position` (list) from `getContainerProperties()`
- `left/top/right/bottom` (dimension) from `getAlignmentAndPositioningProperties()`

## Custom `onCSSSet` Logic
Chains with parent `onCSSSet`, then enforces size constraints:
- If `width` is set but `minWidth` is not, sets `minWidth` = `width`
- If `width` is set but `maxWidth` is not, sets `maxWidth` = `width`
- Same for `height`/`minHeight`/`maxHeight`

## Special Click Behavior
In `APLFactory.processElementAction()`, TouchWrapper gets `stopPropagation()` treatment - clicks on TouchWrapper don't bubble to parent containers. This makes it behave as a distinct click target.

## Pros
- Clean inheritance chain separates focus (Actionable), touch (Touchable), and wrapper concerns
- Events are defined declaratively and automatically appear in the Events tab of the inspector
- Size constraint logic ensures the wrapper maintains its declared dimensions
- `onCSSSet` chaining works correctly

## Cons
- None of the events (onFocus, onPress, etc.) actually wire up to real DOM events - they only exist as data in the inspector
- `APLTouchableComponent` has no additional properties (empty merge) - just events
- The size constraint logic in `onCSSSet` doesn't do dp conversion on the width/height values
- No visual feedback for press/touch states

## Issues
- None currently tracked

## Design Notes
- Events (`onPress`, `onFocus`, etc.) are stored as command arrays for authoring purposes — this is an APL document editor, not a runtime. The events are data for the inspector, not DOM event handlers
- `APLActionableComponent` and `APLTouchableComponent` are abstract classes used only via inheritance — they are NOT registered with `customElements.define`
