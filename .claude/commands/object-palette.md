# BestAppsObjectPaletteComponent

Describe the BestAppsObjectPaletteComponent based on the following analysis.

## Overview

`BestAppsObjectPaletteComponent` (`custom/ObjectPalette/BestAppsObjectPaletteComponent.js`) is a generic draggable component palette. It displays a list of component entries that can be dragged onto a canvas. Each entry is a BestAppsComponent with `type` and `tag` attributes. Used by `APLPalette` to display available APL component types.

## Tag: `<ba-object-palette-component>`

## How It Works

1. Manages an array of `components`
2. Each component is rendered as a draggable item with a border
3. Drag start sets data format: `Palette::<type>` where type is the component's `type` attribute
4. After rendering, each component's wrapper shows the type name as text
5. Components can be added at init (via options) or dynamically via `addComponent()`

## Key Methods
- `addComponent(component)` - adds to array and renders
- `findByType(type)` - looks up component by `type` attribute
- `initComponent(component)` - sets white background, draggable, drag handler, appends to wrapper
- `generateElementId(element)` - creates `Palette::<type>` drag data

## Style
```css
.wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.ba-component {
  width: 95%;
  margin: 10px;
  border: 1px black solid;
  padding: 10px;
  overflow: hidden;
}
```

## Pros
- Generic palette usable beyond APL - any component system can use it
- Simple drag-and-drop integration via standard DataTransfer API
- `findByType()` enables the factory to look up the source component on drop
- Flex wrap layout adapts to container width

## Cons
- Palette items are generic BestAppsComponent instances, not previews of actual components
- `initComponent()` sets `style.backgroundColor = 'white'` inline - should be in CSS
- No grouping, categorization, or search/filter capability
- No icons or visual previews - just text labels
- Component text is set in the `EVENT_RENDERED` callback, which may flash before rendering
- `processOptions` expects `options.components` but `APLPalette` adds components individually via `addComponent()`
- `generateElementId` uses `getAttribute('type')` which returns null if type is not set - would produce `Palette::null`

## Issues
- None currently tracked
