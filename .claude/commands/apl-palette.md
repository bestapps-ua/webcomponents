# APLPalette

Describe the APLPalette based on the following analysis.

## Overview

`APLPalette` (`custom/APL/APLPalette.js`) is a setup class (not a Web Component) that creates a `BestAppsObjectPaletteComponent` and populates it with draggable APL component entries. Each palette entry represents an APL component type that can be dragged onto the canvas.

## Registered Palette Components

| APL Type | Tag | Create Method |
|---|---|---|
| APLContainer | `<apl-container-component>` | `createContainer()` |
| APLEditText | `<apl-edit-text-component>` | `createEditText()` |
| APLImage | `<apl-image-component>` | `createImage()` |
| APLScrollView | `<apl-scroll-view-component>` | `createScrollView()` |
| APLFrame | `<apl-frame-component>` | `createFrame()` |
| APLText | `<apl-text-component>` | `createText()` |
| APLTouchWrapper | `<apl-touch-wrapper-component>` | `createTouchWrapper()` |

## How It Works

1. Creates a `BestAppsObjectPaletteComponent` inside the provided container
2. Waits for the palette to render (`EVENT_RENDERED`)
3. For each component type, creates a `BestAppsComponent` element with `type` and `tag` attributes
4. Adds each to the palette via `palette.addComponent()`
5. The palette component handles drag initiation with `Palette::<type>` data format

## Pros
- Simple factory pattern - easy to add new component types
- Separation between palette data and palette UI (uses generic `BestAppsObjectPaletteComponent`)
- Each `create*` method is independently callable

## Cons
- Palette entries are plain `BestAppsComponent` elements with `type`/`tag` attributes, not instances of the actual APL component classes. This means the palette can't preview component appearance
- Hardcoded component list - no dynamic registration mechanism
- Missing APL component types: Sequence, Pager, VectorGraphic, Video, GridSequence
- `create()` method creates a `BestAppsComponent` with `ba-component` tag - loses type-specific information
- Initialization timing depends on `EVENT_RENDERED` subscription - if palette renders before subscription, components aren't added
- No categorization or grouping of palette items

## Issues
- None currently tracked
