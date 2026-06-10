# Project Overview: BestApps WebComponents

Provide a comprehensive overview of this project based on the following analysis.

## What This Project Is

This is the **base component framework and generic UI components** for the BestApps WebComponents ecosystem. It provides reusable, framework-agnostic web components for building visual editors. APL-specific components live in a separate repo (`bestapps-ua/webcomponents-apl`), and the full integrated app lives in the orchestration repo (`nvvetal/webcomponents-orchestration`).

## Architecture

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

### 3. Demo Component (`custom/AppYearMonthComponent.js`)
- Year/month date picker - standalone component

## Multi-Repo Structure

This repo is part of a three-repo ecosystem:
- **`bestapps-ua/webcomponents`** (this repo) — Base framework + generic UI
- **`bestapps-ua/webcomponents-apl`** — APL components (uses this repo as a git submodule)
- **`nvvetal/webcomponents-orchestration`** — Ties both repos together, integration tests

## Key Design Patterns

- **No build step** - plain ES6 classes loaded via `<script>` tags
- **Shadow DOM everywhere** - each component encapsulates styles
- **Publish/Subscribe** - internal event bus per component
- **callWithEvent pattern** - every lifecycle method emits a corresponding event
- **Clone-aware** - special `checkClone` mechanism handles DOM cloning across shadow roots

## File Structure

```
BestAppsComponent.js          -- Base component + helpers
utils/
  uid.js                      -- Unique ID generator
  APLComponentRegistry.js     -- Component type registration
custom/
  AppYearMonthComponent.js    -- Year/month date picker
  ObjectInspector/             -- Generic property inspector framework
  ObjectPalette/               -- Draggable component palette
tests/                         -- E2E tests (wdio + Mocha)
```

## Tests

6 test specs covering base framework, inspector, palette, and year-month picker. Run with `npm test`.
