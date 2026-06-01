# Plan: Fix All Component Issues

## Summary

This plan addresses every bug, data-corruption risk, security hole, and correctness issue identified across the codebase. It is organized into four phases by severity. Each item includes the file, line, root cause, fix, and an autotest to verify the fix.

---

## Workflow Per Fix

Every single fix **must** follow this checklist before moving to the next item:

1. **Fix** — apply the code change
2. **Test** — add or update the autotest that covers the fix, run `npm test`, all specs must pass
3. **Skill** — update the corresponding `.claude/commands/<component>.md` skill: remove the issue from the Issues section, move it to a "Resolved" note or delete it entirely
4. **Progress** — update the progress tracker table at the bottom of this plan (mark status, date, commit hash)
5. **Commit** — create a git commit with message: `fix(<component>): <short description>` (e.g., `fix(pubsub): off-by-one in subscribeOnce cleanup`)

Do **not** batch fixes into one commit. Each fix = one commit. This makes bisecting and reverting safe.

---

## Phase 1 — HIGH: Logic Bugs That Cause Wrong Behavior

These are bugs where existing code produces incorrect results. Fix first.

---

### 1.1 PubSub `subscribeOnce` never removes the first handler

**File:** `BestAppsComponent.js:59`
**Bug:** `for (let i = toRemove.length - 1; i > 0; i--)` — the condition `i > 0` skips index 0, so the first once-subscriber is never unsubscribed.
**Fix:** Change `i > 0` to `i >= 0`.
**Test:** `tests/specs/bestapps-component/bestapps-component.test.ts`
Add test:
```
it('should remove subscribeOnce handler after first call', () => {
    // subscribe once, publish twice, assert handler called exactly once
});
```
**Skill:** `bestapps-component.md` — remove off-by-one from Issues
**Commit:** `fix(pubsub): off-by-one in subscribeOnce cleanup`

---

### 1.2 `APLSendEventCommand.components` getter returns arguments

**File:** `custom/APL/ObjectInspector/command/APLSendEventCommand.js:40`
**Bug:** `get components() { return this.#arguments; }` — copy-paste error; should return `this.#components`.
**Fix:** Change `return this.#arguments` to `return this.#components`.
**Test:** `tests/specs/apl-component/apl-component.test.ts` (or new `tests/specs/apl-commands/`)
Add test:
```
it('APLSendEventCommand should return separate arguments and components arrays', () => {
    // create command with distinct arguments and components, verify they don't alias
});
```
**Skill:** `apl-commands.md` — remove getter bug from Issues
**Commit:** `fix(apl-commands): SendEventCommand.components returns wrong field`

---

### 1.3 `PropertyArrayComponent.getFieldValue()` returns hardcoded `'zzz'`

**File:** `custom/ObjectInspector/tab/Property/BestAppsObjectInspectorPropertyArrayComponent.js:80-81`
**Bug:** `console.log('hhh'); return 'zzz';` — debug leftover. All code after line 81 is unreachable. Array value is never returned.
**Fix:** Remove the debug lines. Return the actual array value: `return this.value;`
**Test:** `tests/specs/object-inspector/object-inspector.test.ts`
Add test:
```
it('PropertyArrayComponent should return the current array value from getFieldValue', () => {
    // create array property, set values, verify getFieldValue returns the array
});
```
**Skill:** `object-inspector.md` — remove getFieldValue from Issues
**Commit:** `fix(object-inspector): PropertyArrayComponent.getFieldValue returns debug stub`

---

### 1.4 `processEvents()` double-execution bug

**File:** `custom/ObjectInspector/BestAppsObjectInspectorObjectsComponent.js:157-160`
**Bug:** Outer loop `for (let i = 0; i < len; i++)` wraps inner loop `for (const callback of this.eventList)`. Each callback executes `len` times instead of once.
**Fix:** Remove the outer loop. Keep only the inner `for..of`:
```js
for (const callback of this.eventList) {
    callback();
}
```
**Test:** `tests/specs/object-inspector/object-inspector.test.ts`
Add test:
```
it('should process each event callback exactly once', () => {
    // add 3 events, verify each called once not N times
});
```
**Skill:** `object-inspector.md` — remove processEvents bug from Issues
**Commit:** `fix(object-inspector): processEvents double-execution loop`

---

### 1.5 `APLDom.getAPlDocumentLastChain()` mutates input array

**File:** `custom/APL/APLDom.js:185`
**Bug:** `chains.splice(0, 1)` destroys the caller's array. A second call to `getAplDocumentLastParentItems()` for the same item returns wrong data.
**Fix:** Use a local copy: `chains = chains.slice()` at the top of the method, or use index-based iteration instead of splice.
**Test:** New `tests/specs/apl-dom/` (or manual integration test)
Add test:
```
it('getAplDocumentLastParentItems should return the same result on repeated calls', () => {
    // call twice for the same item, assert results are identical
});
```
**Skill:** `apl-dom.md` — remove destructive splice from Issues
**Commit:** `fix(apl-dom): getAPlDocumentLastChain mutates caller array`

---

### 1.6 `AppYearMonthComponent` click-outside detection broken

**File:** `custom/AppYearMonthComponent.js:42`
**Bug:** `event.target.closest("year-month-component")` — no element with this tag name exists. The correct tag is `ba-app-year-month-component`. Result: click anywhere outside may falsely close the selector, or it never matches so selectors never close.
**Fix:** Change to `event.target.closest("ba-app-year-month-component")`.
**Test:** `tests/specs/app-year-month/app-year-month.test.ts`
Add test:
```
it('should close selectors when clicking outside the component', () => {
    // open selector, click outside, verify closed
});
```
**Skill:** `app-year-month.md` — remove click-outside from Issues
**Commit:** `fix(app-year-month): click-outside uses wrong tag selector`

---

## Phase 2 — HIGH: Security & Data Integrity

---

### 2.1 XSS via `innerHTML` in `APLFactory.initComponent()`

**File:** `custom/APL/APLFactory.js:259,261`
**Bug:**
```js
component.element.wrapper.innerHTML = `<img src="${data.source}" alt="" />`;
component.element.wrapper.innerHTML = `<div>${data.text}</div>`;
```
Both inject unsanitized user-controlled data. A malicious `source` or `text` value can execute arbitrary JavaScript.
**Fix:** Use DOM APIs instead:
```js
// Image
const img = document.createElement('img');
img.src = data.source;
img.alt = '';
component.element.wrapper.replaceChildren(img);

// Text
const div = document.createElement('div');
div.textContent = data.text;
component.element.wrapper.replaceChildren(div);
```
**Test:** `tests/specs/apl-image/apl-image.test.ts` and `tests/specs/apl-text/apl-text.test.ts`
Add tests:
```
it('should not execute script in image source', () => {
    // set source to '"><script>window._xss=1</script>', verify _xss is not set
});
it('should not execute script in text content', () => {
    // set text to '<img onerror="window._xss=1" src=x>', verify _xss is not set
});
```
**Skill:** `apl-factory.md`, `apl-image.md`, `apl-text.md` — remove XSS from Issues
**Commit:** `fix(apl-factory): prevent XSS via innerHTML in initComponent`

---

### 2.2 Dialog `innerHTML` injection

**File:** `custom/APL/Dialogs/APLDialogComponent.js:113`
**Bug:** `this.element.content.innerHTML = data.content` — if content comes from user input, it's injectable.
**Fix:** Use `textContent` instead of `innerHTML`:
```js
this.element.content.textContent = data.content || 'Dialog';
```
**Test:** `tests/specs/apl-document/` (or new dialog test)
Add test:
```
it('dialog should not render HTML in content', () => {
    // show dialog with '<b>bold</b>', verify it shows as literal text
});
```
**Skill:** `apl-dialogs.md` — remove innerHTML from Issues
**Commit:** `fix(apl-dialogs): prevent HTML injection in dialog content`

---

## Phase 3 — MEDIUM: Correctness & Consistency

---

### 3.1 Tooltip color missing `#` prefix

**File:** `custom/ObjectInspector/tab/Property/BestAppsObjectInspectorPropertyComponent.js:99`
**Bug:** `this.nameTooltipEl.style.color = 'fff'` — invalid CSS color. Should be `'#fff'`.
**Fix:** Change to `this.nameTooltipEl.style.color = '#fff'`.
**Test:** `tests/specs/object-inspector/object-inspector.test.ts`
Add test:
```
it('property tooltip should have white text color', () => {
    // inspect tooltip element style.color, verify rgb(255,255,255)
});
```
**Skill:** `object-inspector.md` — remove tooltip color from Issues
**Commit:** `fix(object-inspector): tooltip color missing # prefix`

---

### 3.2 `APLTextComponent.onCSSSet` doesn't chain parent

**File:** `custom/APL/APLTextComponent.js:76`
**Bug:** `properties.onCSSSet = () => {...}` completely replaces the parent's `onCSSSet`. Base APLComponent's absolute positioning logic (left/top/right/bottom) is lost for Text components.
**Fix:** Save and call the parent `onCSSSet` like Frame and TouchWrapper do:
```js
let onCSSSet = properties.onCSSSet;
properties.onCSSSet = () => {
    if (onCSSSet) onCSSSet();
    // ...existing text-specific logic...
};
```
**Test:** `tests/specs/apl-text/apl-text.test.ts`
Add test:
```
it('should have onCSSSet that chains parent behavior', () => {
    // verify properties.onCSSSet is a function that invokes base onCSSSet
});
```
**Skill:** `apl-text.md` — remove onCSSSet chain from Issues
**Commit:** `fix(apl-text): onCSSSet must chain parent for absolute positioning`

---

### 3.3 `connectedCallback` async Promise anti-pattern

**File:** `BestAppsComponent.js:163`
**Bug:** `new Promise(async (resolve, reject) => {...})` — rejections before the first `await` in the executor are silently swallowed.
**Fix:** Refactor to proper async chain:
```js
connectedCallback() {
    this.publish(this.constructor.EVENT_CONNECTING, this);
    (async () => {
        await this.callWithEvent('initProps', this.constructor.EVENT_PROPS_SET);
        await this.callWithEvent('initElements', this.constructor.EVENT_ELEMENTS_SET);
        await this.callWithEvent('render', this.constructor.EVENT_RENDERED);
        await this.callWithEvent('initConnected', this.constructor.EVENT_CONNECTED);
    })().catch((err) => {
        this.warning('connectedCallback', err);
    });
}
```
**Test:** `tests/specs/bestapps-component/bestapps-component.test.ts`
Verify existing tests still pass (lifecycle must work the same). Add:
```
it('should emit error event if initProps throws', () => {
    // subclass with throwing initProps, verify EVENT_ERROR fires
});
```
**Skill:** `bestapps-component.md` — remove async Promise anti-pattern from Issues
**Commit:** `fix(bestapps-component): refactor connectedCallback async promise anti-pattern`

---

### 3.4 `setOption()` doesn't fire `EVENT_OPTIONS_SET`

**File:** `BestAppsComponent.js:371-374`
**Bug:** `setOption(key, value)` mutates `options[key]` directly but never fires `EVENT_OPTIONS_SET` or calls `processOptions`. Inconsistent with `setOptions()` which does.
**Fix:** Call `setOptions` internally:
```js
async setOption(key, value) {
    await this.setOptions({ [key]: value });
}
```
**Test:** `tests/specs/bestapps-component/bestapps-component.test.ts`
Add test:
```
it('setOption should fire EVENT_OPTIONS_SET', () => {
    // subscribe to EVENT_OPTIONS_SET, call setOption, verify event fires
});
```
**Skill:** `bestapps-component.md` — remove setOption inconsistency from Cons
**Commit:** `fix(bestapps-component): setOption now fires EVENT_OPTIONS_SET`

---

### 3.5 Vendor script ID collision

**File:** `custom/APL/APL.js:235` and `custom/APL/APLLoader.js:96`
**Bug:** All dynamically loaded scripts get `id='json_script'`. Multiple vendors overwrite each other's ID.
**Fix:** Use a unique ID per vendor:
```js
jsonScript.id = `vendor_${data.name.replace(/\s+/g, '_')}`;
```
And in APLLoader:
```js
jsonScript.id = `schema_${Date.now()}`;
```
**Test:** Integration test (manual or fixture-level). Verify both vendor scripts are present in `<head>` after load.
**Skill:** `apl.md` — remove vendor ID collision from Issues
**Commit:** `fix(apl): unique IDs for dynamically loaded vendor scripts`

---

### 3.6 `APLDocumentComponent` overrides parent style entirely

**File:** `custom/APL/APLDocumentComponent.js:6`
**Bug:** `getStyle()` replaces (commented-out `super.getStyle()`) the parent style. The red selection border from APLComponent is lost.
**Fix:** Uncomment `let style = super.getStyle();` and append document-specific styles.
**Test:** `tests/specs/apl-document/apl-document.test.ts`
Add test:
```
it('should show selection border when class "selected" is added', () => {
    // add 'selected' class, verify border appears
});
```
**Skill:** `apl-document.md` — remove lost selected state from Issues
**Commit:** `fix(apl-document): inherit parent styles for selection border`

---

### 3.7 APLContainerComponent missing position properties

**File:** `custom/APL/APLContainerComponent.js`
**Bug:** Unlike Frame, Text, and TouchWrapper, Container does not merge `getContainerProperties()` or `getAlignmentAndPositioningProperties()`. Container children can't use `position: absolute`.
**Fix:** Add merges in `getAPLProperties()`:
```js
properties = Object.assign(APLProperties.getContainerProperties(), properties);
properties = Object.assign(APLProperties.getAlignmentAndPositioningProperties(), properties);
```
**Test:** `tests/specs/apl-container/apl-container.test.ts`
Update existing test — add `testPositionProperties(fixture)`, should pass after the fix.
**Skill:** `apl-container.md` — remove missing position properties from Issues
**Commit:** `fix(apl-container): add position and alignment properties`

---

### 3.8 `localStorage` key not namespaced

**File:** `custom/APL/ObjectInspector/APLObjectInspectorObjectsComponent.js:77,97`
**Bug:** Uses `apl-object-inspector-objects-component.component` as the key. Multiple editor instances or pages would collide.
**Fix:** Prefix with a unique context identifier (e.g., page URL hash or a configurable namespace):
```js
const storageKey = `${APLObjectInspectorObjectsComponent.tag}.${window.location.pathname}.component`;
```
**Test:** `tests/specs/object-inspector/object-inspector.test.ts`
Add test:
```
it('should namespace localStorage keys by page', () => {
    // verify localStorage key contains the page path
});
```
**Skill:** `apl-inspector.md` — remove localStorage collision from Issues
**Commit:** `fix(apl-inspector): namespace localStorage keys by page path`

---

### 3.9 AppYearMonthComponent leaks window event listeners

**File:** `custom/AppYearMonthComponent.js:41`
**Bug:** `window.addEventListener('mouseup', ...)` is added per instance in `initElements()` and never removed in `processDisconnected()`. Creating/destroying instances leaks handlers.
**Fix:** Store the handler reference and remove it on disconnect:
```js
this._mouseUpHandler = (event) => { ... };
window.addEventListener('mouseup', this._mouseUpHandler);
```
```js
async processDisconnected() {
    window.removeEventListener('mouseup', this._mouseUpHandler);
}
```
**Test:** `tests/specs/app-year-month/app-year-month.test.ts`
Add test:
```
it('should clean up window event listeners on disconnect', () => {
    // create, disconnect, verify handler count doesn't grow
});
```
**Skill:** `app-year-month.md` — remove event listener leak from Issues
**Commit:** `fix(app-year-month): remove window mouseup listener on disconnect`

---

## Phase 4 — LOW: Code Quality & Completeness

---

### 4.1 Duplicate `generateUid()` in APLCommand

**File:** `custom/APL/ObjectInspector/command/APLCommand.js:55-63`
**Bug:** Same implementation as `BestAppsComponent.generateUid()`. Duplicated code.
**Fix:** Extract to a shared utility function:
```js
// utils/uid.js
function generateUid() { ... }
```
Import in both BestAppsComponent and APLCommand.
**Test:** Existing guid tests should still pass. Add unit test for `generateUid()` standalone.
**Skill:** `apl-commands.md` — remove UID duplication from Issues
**Commit:** `refactor(utils): extract shared generateUid utility`

---

### 4.2 `_data.subscriptions` Map is never used

**File:** `BestAppsComponent.js:125`
**Bug:** `initData()` creates `subscriptions: new Map()` in `_data`, but the pub/sub system uses `BestAppsPublishSubscribe.events` instead. The Map is dead code.
**Fix:** Remove `subscriptions: new Map()` from `initData()`.
**Test:** Existing tests should still pass. No new test needed.
**Skill:** `bestapps-component.md` — remove dead subscriptions Map from Cons
**Commit:** `refactor(bestapps-component): remove unused subscriptions Map`

---

### 4.3 APLScrollViewComponent is a non-functional stub

**File:** `custom/APL/APLScrollViewComponent.js`
**Bug:** Component exists in the palette but has no scroll behavior. The base wrapper's `overflow: hidden` actually prevents scrolling.
**Fix:** Add `overflow: auto` to the wrapper style and implement `onScroll` event property.
**Test:** `tests/specs/apl-scrollview/apl-scrollview.test.ts`
Add test:
```
it('wrapper should have overflow auto for scrolling', () => {
    // verify computed style overflow is 'auto'
});
```
**Skill:** `apl-scrollview.md` — update overview to reflect implementation, remove "non-functional" from Issues
**Commit:** `feat(apl-scrollview): implement scroll behavior with overflow auto`

---

### 4.4 APLEditTextComponent renders no input element

**File:** `custom/APL/APLEditTextComponent.js`
**Bug:** Despite being an "EditText", no `<input>` or `<textarea>` is created. The component is a data-only stub.
**Fix:** Override `initElements()` to create an input element inside the wrapper. Wire up `text` and `color` properties to the input.
**Test:** `tests/specs/apl-edittext/apl-edittext.test.ts`
Add test:
```
it('should render an input element inside the shadow DOM', () => {
    // verify wrapper contains an <input> or <textarea>
});
```
**Skill:** `apl-edittext.md` — update overview to reflect implementation, remove "non-functional" from Issues
**Commit:** `feat(apl-edittext): render input element in shadow DOM`

---

### 4.5 APLImageComponent missing position properties

**File:** `custom/APL/APLImageComponent.js`
**Bug:** Unlike Frame, Text, and TouchWrapper, Image doesn't merge `getContainerProperties()` or `getAlignmentAndPositioningProperties()`.
**Fix:** Add merges in `getAPLProperties()` (same pattern as APLFrameComponent).
**Test:** `tests/specs/apl-image/apl-image.test.ts`
Add `testPositionProperties(fixture)` — should pass after fix.
**Skill:** `apl-image.md` — remove missing position properties from Issues
**Commit:** `fix(apl-image): add position and alignment properties`

---

### 4.6 APLFactory items array never cleaned up

**File:** `custom/APL/APLFactory.js`
**Bug:** `addItem()` pushes components to `items` but `cloneByDomItemsMove()` creates new items without removing old ones from the array. Over time this leaks memory.
**Fix:** Add a `removeItem(guid)` method and call it from `removeMovedItemChildrens()`:
```js
removeItem(guid) {
    const idx = this.items.findIndex(i => i.guid === guid);
    if (idx !== -1) this.items.splice(idx, 1);
}
```
**Test:** Integration test verifying `factory.getItems().length` after a move operation.
**Skill:** `apl-factory.md` — remove memory leak from Issues
**Commit:** `fix(apl-factory): clean up items array on component move`

---

### 4.7 Tooltip leaks DOM elements to `document.body`

**File:** `custom/ObjectInspector/tab/Property/BestAppsObjectInspectorPropertyComponent.js:103`
**Bug:** `document.body.appendChild(this.nameTooltipEl)` — tooltip is appended outside shadow DOM to the global body. Multiple property editors leak tooltip elements.
**Fix:** Append to the component's own shadow DOM wrapper instead:
```js
this.element.wrapper.appendChild(this.nameTooltipEl);
```
Adjust positioning to be relative to the shadow root.
**Test:** `tests/specs/object-inspector/object-inspector.test.ts`
Add test:
```
it('should not append tooltip elements to document.body', () => {
    // verify document.body does not contain .ba-tooltip-text elements
});
```
**Skill:** `object-inspector.md` — remove tooltip DOM leak from Issues
**Commit:** `fix(object-inspector): tooltip renders inside shadow DOM`

---

### 4.8 APLScreen width not managed

**File:** `custom/APL/APLScreen.js`
**Bug:** `resizeHeight()` adjusts container height for dp ratio, but width is never set. Changing to a device with different aspect ratio produces unexpected dp ratios since width stays at the CSS-defined value.
**Fix:** Add `resizeWidth()` or rename to `resize()` and handle both dimensions:
```js
resize() {
    const dppx = this.getDPSize();
    this.container.style.height = `${this.resolution.height * dppx}px`;
}
```
Width should be handled by maintaining aspect ratio or being explicitly set.
**Test:** `tests/specs/apl-screen/apl-screen.test.ts`
Add test:
```
it('should maintain correct dp ratio after device change', () => {
    // switch device, verify dp calculation is still valid
});
```
**Skill:** `apl-screen.md` — remove width management from Issues
**Commit:** `fix(apl-screen): manage container dimensions on device change`

---

### 4.9 `APLFrameComponent` borderWidth dimension handling

**File:** `custom/APL/APLFrameComponent.js:46-49`
**Bug:** `onCSSSet` checks `borderWidth === parseFloat(borderWidth).toString()` which only matches plain numeric strings. Values with units like `"2dp"` or `"2px"` are not handled.
**Fix:** Use the screen's `getSizePixels()` for dp conversion and handle px values:
```js
if (borderWidth) {
    let bw = this.getFactory()?.getScreen()?.getSizePixels(borderWidth) || borderWidth;
    this.style.borderWidth = typeof bw === 'number' ? `${bw}px` : bw;
    this.style.borderStyle = 'solid';
}
```
**Test:** `tests/specs/apl-frame/apl-frame.test.ts`
Add test for borderWidth property type and handling.
**Skill:** `apl-frame.md` — remove borderWidth bug from Issues
**Commit:** `fix(apl-frame): handle dp and px units in borderWidth`

---

## Execution Order

```
Phase 1 (HIGH - Logic bugs):
  1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
  Each: fix → test → update skill → update progress → commit

Phase 2 (HIGH - Security):
  2.1 → 2.2
  Each: fix → test → update skill → update progress → commit

Phase 3 (MEDIUM - Correctness):
  3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8 → 3.9
  Each: fix → test → update skill → update progress → commit

Phase 4 (LOW - Quality):
  4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7 → 4.8 → 4.9
  Each: fix → test → update skill → update progress → commit
```

## Estimated Effort

| Phase | Items | Effort    | Risk   |
|-------|-------|-----------|--------|
| 1     | 6     | ~2 hours  | Low — isolated fixes with clear before/after |
| 2     | 2     | ~30 min   | Low — swapping innerHTML for DOM API |
| 3     | 9     | ~3 hours  | Medium — some touch lifecycle and event flow |
| 4     | 9     | ~4 hours  | Medium — stubs need new rendering code |
| **Total** | **26** | **~9.5 hours** | |

---

## Progress Tracker

| ID  | Description                                      | Status  | Date | Commit  |
|-----|--------------------------------------------------|---------|------|---------|
| 1.1 | PubSub subscribeOnce off-by-one                  | done    | 2026-06-01 | pending-commit |
| 1.2 | SendEventCommand.components wrong return          | done    | 2026-06-01 | pending-commit |
| 1.3 | PropertyArrayComponent.getFieldValue returns zzz  | done    | 2026-06-01 | pending-commit |
| 1.4 | processEvents double-execution                    | done    | 2026-06-01 | pending-commit |
| 1.5 | APLDom.getAPlDocumentLastChain mutates array       | done    | 2026-06-01 | pending-commit |
| 1.6 | AppYearMonth click-outside wrong selector          | done    | 2026-06-01 | pending-commit |
| 2.1 | XSS via innerHTML in APLFactory                   | done    | 2026-06-01 | pending-commit |
| 2.2 | Dialog innerHTML injection                        | done    | 2026-06-01 | pending-commit |
| 3.1 | Tooltip color missing # prefix                    | done    | 2026-06-01 | pending-commit |
| 3.2 | APLText onCSSSet doesn't chain parent              | done    | 2026-06-01 | pending-commit |
| 3.3 | connectedCallback async Promise anti-pattern       | done    | 2026-06-01 | pending-commit |
| 3.4 | setOption doesn't fire EVENT_OPTIONS_SET            | done    | 2026-06-01 | pending-commit |
| 3.5 | Vendor script ID collision                         | done    | 2026-06-01 | pending-commit |
| 3.6 | APLDocument overrides parent style entirely         | done    | 2026-06-01 | pending-commit |
| 3.7 | APLContainer missing position properties            | pending |      |         |
| 3.8 | localStorage key not namespaced                    | pending |      |         |
| 3.9 | AppYearMonth leaks window event listeners           | pending |      |         |
| 4.1 | Duplicate generateUid in APLCommand                 | pending |      |         |
| 4.2 | Dead _data.subscriptions Map                        | pending |      |         |
| 4.3 | APLScrollView non-functional stub                   | pending |      |         |
| 4.4 | APLEditText renders no input                        | pending |      |         |
| 4.5 | APLImage missing position properties                | pending |      |         |
| 4.6 | APLFactory items never cleaned up                   | pending |      |         |
| 4.7 | Tooltip leaks DOM to document.body                  | pending |      |         |
| 4.8 | APLScreen width not managed                         | pending |      |         |
| 4.9 | APLFrame borderWidth dimension handling              | pending |      |         |
