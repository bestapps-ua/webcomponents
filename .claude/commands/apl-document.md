# APLDocumentComponent

Describe the APLDocumentComponent based on the following analysis.

## Overview

`APLDocumentComponent` (`custom/APL/APLDocumentComponent.js`) represents the root APL document - the top-level canvas that holds all APL components. It extends `APLComponent` and overrides only the styles to create a full-size black canvas with flex column layout. Created by `APLFactory.create()` and serves as the root drop target.

## Tag: `<apl-document-component>`

## Implementation

34 lines total. Its sole purpose is styling the root container.

## Styles
```css
:host {
  display: block;
  width: 100%; height: 100%;
  max-width: 100%; max-height: 100%;
}
.wrapper {
  width: 100%; height: 100%;
  max-width: 100%; max-height: 100%;
  background-color: black;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  flex-shrink: 0;
  overflow: hidden;
  flex-basis: 100%;
}
```

## Role in the System

1. Created by `APLFactory.create(APLDocumentComponent, container)` in `APL.init()`
2. Receives drag-and-drop events via `APLFactory.dropHandler()` - when items are dropped on the document, they become top-level children
3. Passed to `APLLoader` as the root container for schema loading
4. Passed to `APLDom` as the root of the virtual tree

## Pros
- Clear separation of root canvas from child components
- Black background mimics actual Alexa device screen
- Flex column layout is correct for APL's default top-to-bottom flow
- Simple and focused - does one thing

## Cons
- No APL document-level properties (theme, settings, import, resources, etc.)
- Hardcoded black background - APL supports custom background colors
- `overflow: hidden` prevents seeing components that extend beyond canvas bounds during editing
- No visual indicators for the canvas boundaries

## Issues
- None currently tracked
