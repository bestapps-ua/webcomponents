# APLScreen & APLScreenComponent

Describe the APLScreen utility class and APLScreenComponent based on the following analysis.

## Overview

**APLScreen** (`custom/APL/APLScreen.js`) is a utility class (not a Web Component) that manages device resolution, dp-to-pixel conversion, and screen resizing. It holds the current device profile and resolution, and emits events when they change.

**APLScreenComponent** (`custom/APL/APLScreenComponent.js`) is a Web Component UI that provides device and resolution dropdowns, allowing users to switch between Alexa devices and their resolution modes.

## Tags
- `<apl-screen-component>` (APLScreenComponent)

## APLScreen

### Device Profiles (static)
| Device | Resolutions |
|---|---|
| Echo Show 2 | 1280x800, 1280x750 |
| Echo Show 5 | 960x480 |
| Echo Spot | 480x480 |

### Key Methods
- `getDPSize()` - calculates dp-to-pixel ratio: `container.offsetWidth / resolution.width`
- `getSizePixels(val, parentSize)` - converts APL dimension values:
  - `"100dp"` -> `dpRatio * 100` pixels
  - `"50%"` -> `50% of parentSize` pixels
  - Other values pass through unchanged
- `setDevice(device, resolution)` - switches device, fires resolution change
- `setResolution(item)` - switches resolution within current device
- `resizeHeight()` - recalculates container height based on dp ratio

### Events
- `EVENT_RESOLUTION_CHANGE` - fired with `{old, current}` resolution objects

### Own Event System
APLScreen implements its own subscribe/emit system using a `Map` (not BestAppsPublishSubscribe). This is because it's not a component and doesn't inherit from BestAppsComponent.

## APLScreenComponent

Extends `BestAppsComponent` (not APLComponent). Renders two `<select>` dropdowns:
1. **Device selector** - lists all devices from `APLScreen.getScreens()`
2. **Resolution selector** - lists resolutions for the current device

When the device changes, the resolution dropdown refreshes. Both selectors fire `APLScreen.setDevice()` / `setResolution()` which triggers cascading updates through the APL system.

## Pros
- Clean separation: APLScreen handles math, APLScreenComponent handles UI
- dp conversion correctly uses container width ratio, not a fixed scale
- Multiple resolutions per device support (Echo Show 2 has two)
- Resolution change event propagates to all components for re-rendering
- `getSizePixels()` handles dp, percentage, and passthrough values

## Cons
- Device list is hardcoded - no way to add custom devices
- `getSizePixels()` doesn't handle `px`, `vh`, `vw`, or other CSS units
- APLScreen uses its own event system instead of reusing BestAppsPublishSubscribe
- APLScreenComponent rebuilds the entire resolution dropdown on change (removes and re-creates DOM)
- No visual preview of device frame/bezel
- `parseInt(item.id)` comparison in resolution change is fragile if IDs are non-numeric

## Issues
- None currently tracked
