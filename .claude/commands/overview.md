# Project Overview: BestApps WebComponents

Provide a comprehensive overview of this project based on the following analysis.

## What This Project Is

This is a **visual editor/designer for Amazon APL (Alexa Presentation Language)** layouts, built entirely with vanilla Web Components (no frameworks). It allows users to visually compose APL screens for Alexa devices (Echo Show, Echo Spot) using drag-and-drop, inspect/edit component properties, manage events and commands, and export the resulting APL JSON.

## Architecture

The project has three layers:

### 1. Base Component Framework (`BestAppsComponent.js`)
A custom Web Components base class that extends `HTMLElement` with:
- Shadow DOM encapsulation
- Lifecycle hooks (`initProps`, `initElements`, `render`, `initConnected`)
- Publish/Subscribe event system (`BestAppsPublishSubscribe`)
- Deferred/Promise pattern (`BestAppsDeferred`)
- Clone detection (handles `cloneNode` across shadow boundaries)
- GUID-based identity
- Debug mode via `debug` attribute

### 2. Generic UI Components (`custom/ObjectInspector/`, `custom/ObjectPalette/`)
Reusable, APL-agnostic inspector and palette components:
- **ObjectInspector** - property editor with tabs, supports text/list/array/color/dimension property types
- **ObjectPalette** - drag-source component palette
- **PropertyAdaptor** - bridges selected components to the inspector UI
- **Tabs system** - generic tabbed panels

### 3. APL Layer (`custom/APL/`)
APL-specific components and orchestration:
- **APL** - main orchestrator that wires everything together
- **APLFactory** - creates/clones/manages APL components, handles drag-and-drop
- **APLDom** - virtual tree representation mirroring the APL document structure
- **APLLoader** - loads APL JSON schemas and instantiates component trees
- **APLScreen** - device resolution management (Echo Show, Echo Spot, etc.)
- **APLComponent** - base APL component with properties/events/parent-child
- **Visual components** - Container, Frame, Image, Text, TouchWrapper, ScrollView, EditText, Document
- **Commands** - APLCommand, SendEvent, SetValue
- **Dialogs** - modal and confirm dialog components

## Key Design Patterns

- **No build step** - plain ES6 classes loaded via `<script>` tags
- **Shadow DOM everywhere** - each component encapsulates styles
- **Publish/Subscribe** - internal event bus per component, plus global APL-level pubsub
- **callWithEvent pattern** - every lifecycle method emits a corresponding event
- **Property descriptor system** - declarative property definitions with type, CSS mapping, and APL mapping
- **Clone-aware** - special `checkClone` mechanism handles DOM cloning across shadow roots

## File Structure

```
BestAppsComponent.js          -- Base component + helpers
custom/
  AppYearMonthComponent.js    -- Year/month date picker (demo/standalone)
  ObjectInspector/             -- Generic property inspector framework
  ObjectPalette/               -- Draggable component palette
  APL/                         -- APL-specific layer
    APL.js                     -- Main orchestrator
    APLComponent.js            -- Base APL component
    APLFactory.js              -- Component creation & drag-drop
    APLDom.js                  -- Virtual DOM tree
    APLLoader.js               -- Schema loader
    APLScreen.js               -- Device resolution
    APLProperties.js           -- Property encode/decode
    APLEvents.js               -- Event encode/decode
    APL*Component.js           -- Visual components
    ObjectInspector/           -- APL-specific inspector extensions
    Dialogs/                   -- Modal dialogs
    Schemas/                   -- APL JSON schemas
    vendor/                    -- Third-party (jsoneditor, treeselectjs)
```

## Pros
- Zero dependencies on frameworks - pure Web Components
- Clean separation between generic inspector/palette and APL-specific logic
- Shadow DOM provides real style encapsulation
- Declarative property system maps APL properties to CSS automatically
- Extensible command system for APL events
- Supports multiple Alexa device resolutions with dp-to-pixel conversion
- Clone-aware architecture handles dynamic DOM manipulation

## Cons
- No build system, bundler, or module system - relies on global script loading order
- No TypeScript - relies on JSDoc and runtime for type safety
- jQuery dependency loaded in `index.html` but barely used (only for clone demo)
- Large vendor files (jsoneditor ~54K lines) committed directly
- No test suite
- `window.apl`, `window.aplFactory`, `window.aplDom` globals create tight coupling
- No package manager usage (empty `package.json`)

## Known Issues
- No error handling for missing vendor scripts or broken schema files
- `localStorage` usage in APLObjectInspectorObjectsComponent is not namespaced
