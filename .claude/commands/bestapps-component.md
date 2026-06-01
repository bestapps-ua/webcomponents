# BestAppsComponent

Describe the `BestAppsComponent` base class and its helper classes based on the following analysis.

## Overview

`BestAppsComponent` (`BestAppsComponent.js`) is the foundational Web Component base class for the entire project. It extends `HTMLElement` and provides a structured lifecycle, publish/subscribe eventing, Shadow DOM setup, clone detection, and debug tooling. Every component in the project inherits from this class.

Two helper classes live in the same file:
- **BestAppsDeferred** - wraps a Promise with externally-accessible `resolve`/`reject` methods
- **BestAppsPublishSubscribe** - lightweight event bus with subscribe/unsubscribe/publish and once-only subscriptions

## Tag: `<ba-component>`

## Lifecycle Flow

```
constructor() -> initData() -> initSubscriptions()
connectedCallback() ->
  EVENT_CONNECTING -> processConnecting()
  initProps()      -> EVENT_PROPS_SET
  initElements()   -> EVENT_ELEMENTS_SET
  render()         -> EVENT_RENDERED
  initConnected()  -> EVENT_CONNECTED -> checkClone() -> processConnected()
```

All lifecycle methods are async and wrapped by `callWithEvent()` which catches errors and publishes the corresponding event.

## Key Features

- **Shadow DOM**: `initElements()` creates shadow root (open mode), style element, and wrapper div with `part="wrapper"`
- **GUID identity**: 12-char crypto-random ID via `generateUid()`, stored as `guid` attribute
- **Options system**: `getDefaultOptions()`, `setOptions()`, `setOption()`, with `EVENT_OPTIONS_SET`
- **Data store**: `_data` object with `options` and `subscriptions` keys
- **Clone detection**: `checkClone()` searches across shadow roots to detect cloned elements by matching GUID attributes, then calls `clonedCallback()` to transfer data from the original
- **Debug mode**: set `debug` attribute on any component to log all events to console
- **Refresh cycle**: `refresh()` calls `onBeforeRefresh()` -> `render()` -> `onAfterRefresh()`
- **Custom event listener**: `getEventListenerName()` prefixes events with `ba-`

## Events (static constants)

| Event | When |
|---|---|
| `EVENT_CHANGED` | Any component change via `sendChanged()` |
| `EVENT_ATTRIBUTE_CHANGED` | HTML attribute changed |
| `EVENT_CLONED` | Component detected as a clone |
| `EVENT_CONNECTING` | Before `initProps` |
| `EVENT_CONNECTED` | After `initConnected` |
| `EVENT_RENDERED` | After `render` |
| `EVENT_DISCONNECTED` | Element removed from DOM |
| `EVENT_ADOPTED` | Element moved to new document |
| `EVENT_PROPS_SET` | After `initProps` |
| `EVENT_ELEMENTS_SET` | After `initElements` |
| `EVENT_OPTIONS_SET` | After `setOptions` |
| `EVENT_ERROR` | On error in `callWithEvent` |
| `EVENT_UPDATE` | External update via `ba-update` DOM event |

## Pros
- Clean lifecycle abstraction over raw Web Component callbacks
- Built-in pub/sub means no external event library needed
- Clone detection is unique and handles shadow DOM edge cases
- `callWithEvent` pattern ensures every lifecycle step is observable
- Debug mode is trivially activated per-component via HTML attribute
- `loadedDefer` lets external code await component initialization

## Cons
- No unsubscribe mechanism is used in practice - risk of memory leaks for long-lived components
- `checkClone` does a full document traversal including all shadow roots - potentially expensive on large trees
- `_data.subscriptions` Map is initialized but never used (the pub/sub system uses its own `events` object)
- `observedAttributes` only includes `['debug']` in the base class; subclasses must remember to spread `defaultObservedAttributes`

## Issues
- None currently tracked
