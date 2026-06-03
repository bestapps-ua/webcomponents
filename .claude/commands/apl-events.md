# APL Events & Communication

Describe the event and communication architecture of the APL system based on the following analysis.

## Overview

The APL editor uses two distinct event mechanisms that serve different purposes. Understanding when to use each is critical for maintaining the decoupled architecture.

## 1. Instance Pub/Sub (BestAppsPublishSubscribe)

Every `BestAppsComponent` has its own `this.pubsub` instance created in the constructor. Used for **component-scoped** communication — listeners subscribe to a specific component's events.

### API

```js
component.subscribe(eventName, handler)       // permanent listener
component.subscribeOnce(eventName, handler)    // fires once, then auto-removes
component.unsubscribe(eventName, handler)      // remove listener
component.publish(eventName, data)             // fire event
```

### When to Use

- One component reacting to another's state change
- Parent watching a child for a specific lifecycle event
- Factory subscribing to a component's `EVENT_MOVED` or `EVENT_RENDERED`

### Key Events (instance-level)

| Constant | Value | Fired by | Purpose |
|---|---|---|---|
| `EVENT_PARENT_SET` | `parent::set` | `APLComponent.setAPLParent()` | Notifies that this component's parent was set (every call) |
| `EVENT_MOVED` | `moved` | `APLFactory.cloneByDomItemsMove()` | Notifies that a component finished moving in the tree |
| `EVENT_RENDERED` | `rendered` | `BestAppsComponent.connectedCallback` | Component finished rendering (initElements + render complete) |
| `EVENT_CONNECTED` | `connected` | `BestAppsComponent.connectedCallback` | Component fully initialized |
| `EVENT_CHANGED` | `changed` | Various | Generic change notification (used by inspector) |
| `EVENT_OPTIONS_SET` | `options.set` | `BestAppsComponent.setOptions()` | Options were updated |

### Example

```js
component.subscribeOnce(APLComponent.EVENT_MOVED, async (data) => {
    // React to this specific component finishing a move
    console.log('Component moved, select was open:', data.isComponentSelectOpen);
});
```

## 2. DOM CustomEvent (Cross-Component, Decoupled)

Used for **application-level** events that need to reach the orchestrator without any direct reference. Events bubble up through the DOM (including across shadow DOM boundaries via `composed: true`) and are caught by a document-level listener.

### When to Use

- A component needs to signal something to the APL orchestrator without holding a reference to it
- The event represents a structural change to the component tree
- The consumer is unknown to the producer (loose coupling)

### Key Events (DOM-level)

| Event Name | Constant | Dispatched by | Listener | Purpose |
|---|---|---|---|---|
| `parent::changed` | `APLComponent.EVENT_PARENT_CHANGED` | `APLComponent.setAPLParent()` | `APL.init()` via `document.addEventListener` | Component re-parented (not first parent — only when parent *changes*) |

### Dispatch Pattern

```js
this.dispatchEvent(new CustomEvent(APLComponent.EVENT_PARENT_CHANGED, {
    bubbles: true,       // bubble up through DOM
    composed: true,      // cross shadow DOM boundaries
    detail: {
        component: this,
        parent: parent.guid,
        oldParent: oldParentGuid
    }
}));
```

### Listener Pattern (in APL orchestrator)

```js
document.addEventListener(APLComponent.EVENT_PARENT_CHANGED, (e) => {
    const data = e.detail;
    let parentItem = this.aplDom.findByGuid(data.parent);
    if (!parentItem) return;
    let res = this.aplDom.move(data.component, parentItem);
    if (!res.remove || !res.moveTo) return;
    this.aplFactory.cloneByDomItemsMove(res.remove, res.moveTo);
});
```

### Important: `composed: true`

All APL components live inside shadow DOM trees (created by `BestAppsComponent.initElements()`). Without `composed: true`, a CustomEvent with `bubbles: true` will stop at the shadow root boundary and never reach `document`. Always set both flags for events that need to reach the orchestrator.

## 3. Dependency Injection (setContext)

`APLObjectInspectorObjectsComponent` receives its dependencies via `setContext()` rather than accessing globals. This is called by the APL orchestrator during `init()`.

### API

```js
inspector.objectsSelectorComponent.setContext({
    aplDom,          // APLDom instance — tree operations
    aplFactory,      // APLFactory instance — component creation, selection
    viewComponent,   // (component) => void — applies CSS from APL properties
});
```

### Injected Deps Used For

| Property | Used in | Purpose |
|---|---|---|
| `this._aplDom` | `addOption()`, `optionDropHandler()` | `findByGuid()`, `move()`, `getChildrenFlatList()` |
| `this._aplFactory` | `addOption()`, `optionDropHandler()` | `onSelect()`, `cloneByDomItemsMove()` |
| `this._viewComponent` | `addOption()` | Re-renders component visuals after tree move |

### In Tests

```js
inspector.objectsSelectorComponent.setContext({
    aplDom: mockDom,
    aplFactory: mockFactory,
    viewComponent: () => {},
});
```

## Decision Guide: Which Mechanism to Use

| Scenario | Use |
|---|---|
| Reacting to a specific component's state | Instance pub/sub (`component.subscribe(...)`) |
| Component signaling the orchestrator without a reference | DOM CustomEvent (`this.dispatchEvent(...)`) |
| Passing services to a sub-component for later use | Dependency injection (`setContext(...)` or options) |
| APL orchestrator needs to broadcast to all tabs | `updateTabs()` (iterates tabs directly) |

## Architecture Rules

1. **No globals** — components never reference `window.apl`, `window.aplFactory`, or `window.aplDom`. Dependencies are injected via setters, options, or `setContext()`.
2. **CustomEvents must set `composed: true`** — all APL components render inside shadow DOM; without this flag, events won't reach document-level listeners.
3. **Instance pub/sub is for known targets** — you subscribe to a specific component you already have a reference to.
4. **DOM events are for unknown listeners** — the dispatcher doesn't know who's listening or how many listeners there are.
5. **`EVENT_PARENT_CHANGED` only fires on re-parent** — not on initial `setAPLParent()`. Condition: `oldParentGuid && oldParentGuid !== parent.guid`.
