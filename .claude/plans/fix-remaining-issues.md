# Plan: Fix Remaining Issues from Skill Audits

## Summary

After completing the first 26-item plan, an audit of all `.claude/commands/*.md` ## Issues sections revealed 19 remaining items. Some are real bugs, some are missing features, some are architectural concerns, and a few are incorrect descriptions that need skill corrections only.

This plan follows the same workflow per fix:
1. **Fix** — apply the code change
2. **Test** — add or update autotest, run `npm test`, all specs must pass
3. **Skill** — update the `.claude/commands/<component>.md`
4. **Progress** — update tracker table below
5. **Commit** — one commit per fix: `fix(<scope>): <description>`

---

## Phase 1 — HIGH: Bugs & Correctness

---

### 1.1 APLText: dead CSS properties not mapped

**File:** `custom/APL/APLTextComponent.js:25-72`
**Issue:** `fontStyle`, `letterSpacing`, `lineHeight`, `textAlign` have direct CSS equivalents but empty `options: {}`. They show in the inspector but never affect rendering.
**Fix:** Add `css: true` to `fontStyle`, `letterSpacing`, `lineHeight`, `textAlign`. Note: `maxLines` maps to `-webkit-line-clamp` (needs `display: -webkit-box`), and `textAlignVertical` has no CSS equivalent — leave those as-is.
**Test:** `tests/specs/apl-text/apl-text.test.ts` — add test verifying these properties have `css` in their options.
**Skill:** `apl-text.md` — remove "Dead CSS properties" from Issues
**Commit:** `fix(apl-text): map fontStyle, letterSpacing, lineHeight, textAlign to CSS`

---

### 1.2 APLDom: removed nodes not cleaned up (GC leak)

**File:** `custom/APL/APLDom.js:48-55`
**Issue:** `removeByGuid()` splices the item from the array but doesn't null out `item.parent` or `item.component` references, preventing garbage collection of removed subtrees.
**Fix:** In `removeByGuid()`, after splice, null the references:
```js
item.parent = null;
item.component = null;
```
**Test:** Existing DOM tests pass. Add test verifying removed item has nulled references.
**Skill:** `apl-dom.md` — remove "No cleanup" from Issues
**Commit:** `fix(apl-dom): null references on node removal for garbage collection`

---

### 1.3 APLDom: inconsistent child access (`items` vs `item`)

**File:** `custom/APL/APLDom.js:107,130,187`
**Issue:** `getChildrenFlatList()` and `getComponentDataByItem()` both have inline `getItems(i) { return i.items || i.item || [] }` — duplicated helper, inconsistent naming.
**Fix:** Extract as a class method:
```js
getNodeChildren(node) {
    return node.items || node.item || [];
}
```
Replace all inline `getItems()` closures with `this.getNodeChildren()`.
**Test:** Existing tests pass. Structural refactor — no behavioral change.
**Skill:** `apl-dom.md` — remove "Inconsistent child access" from Issues
**Commit:** `refactor(apl-dom): extract getNodeChildren to unify child access`

---

### 1.4 APL: missing null checks in onTabChange

**File:** `custom/APL/APL.js:138,154-155,167-168,190`
**Issue:** `source.data.data.command` chains accessed without null guards. If an event fires with incomplete data, the editor crashes.
**Fix:** Add optional chaining:
```js
command = source.data?.data?.command;
commandCurrent = source.data?.data?.commandCurrent;
```
And early-return if missing:
```js
if (!command) return;
```
**Test:** Existing tests. This is defensive — hard to trigger in E2E without a complex fixture. Add guard, verify no regression.
**Skill:** `apl.md` — remove "Missing null checks" from Issues
**Commit:** `fix(apl): add null guards to onTabChange event data access`

---

### 1.5 PropertyAdaptor: setTimeout race condition

**File:** `custom/ObjectInspector/BestAppsPropertyAdaptor.js:33-35`
**Issue:** `setTimeout(() => { this.onComponentLoad(this.getComponent()); }, 1)` — fires asynchronously with no guarantee the component is rendered.
**Fix:** Use `requestAnimationFrame` instead of `setTimeout(fn, 1)` — it fires after the next paint, when the component DOM is more likely ready:
```js
requestAnimationFrame(() => {
    this.onComponentLoad(this.getComponent());
});
```
**Test:** Existing inspector tests pass. Timing change — verify no regression.
**Skill:** `property-adaptor.md` — remove "setTimeout for component load" from Issues
**Commit:** `fix(property-adaptor): use requestAnimationFrame instead of setTimeout`

---

### 1.6 APLDialogs: missing Escape key handler

**File:** `custom/APL/Dialogs/APLDialogComponent.js`
**Issue:** Dialogs don't respond to Escape key, unlike the inspector which listens for it.
**Fix:** Add keydown listener in `initElements()`:
```js
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && this.classList.contains('active')) {
        this.hide();
    }
});
```
**Test:** New dialog fixture + test verifying Escape closes the dialog.
**Skill:** `apl-dialogs.md` — remove "Missing Escape key handler" from Issues
**Commit:** `fix(apl-dialogs): close dialog on Escape key`

---

## Phase 2 — MEDIUM: Architecture & Maintainability

---

### 2.1 APLLoader: global `scheme` variable dependency

**File:** `custom/APL/APLLoader.js:101`
**Issue:** `this.scheme = scheme` references a global variable injected by the loaded script. Fragile if any other script defines `scheme`.
**Fix:** Use a configurable variable name:
```js
constructor(props) {
    ...
    this.schemeVar = props.schemeVar || 'scheme';
}
// in getLocalJSON onload:
this.scheme = window[this.schemeVar];
```
**Test:** Existing tests. No behavioral change for default config.
**Skill:** `apl-loader.md` — remove "Global variable dependency" from Issues
**Commit:** `fix(apl-loader): configurable scheme variable name`

---

### 2.2 APLLoader: script tag leak on refresh

**File:** `custom/APL/APLLoader.js:93-97`
**Issue:** `getLocalJSON` adds a `<script>` to `<head>` but `refresh()` never removes it. Calling `refresh()` adds duplicate scripts.
**Fix:** Store the script reference and remove it before adding a new one:
```js
async getLocalJSON(jsonUrl) {
    if (this._schemaScript) {
        this._schemaScript.remove();
    }
    let jsonScript = document.createElement('script');
    this._schemaScript = jsonScript;
    ...
}
```
**Test:** Verify `<head>` doesn't accumulate script tags after refresh.
**Skill:** `apl-loader.md` — remove "Script tag leak" from Issues
**Commit:** `fix(apl-loader): remove old schema script on refresh`

---

### 2.3 APLLoader + APLPalette: no dynamic component registration

**File:** `custom/APL/APLLoader.js:38-64` and `custom/APL/APLPalette.js`
**Issue:** Adding a new APL component type requires changes in 3 places: `APLLoader.createComponents()` switch, `APLPalette.initComponents()`, and the component class. These must stay in sync manually.
**Fix:** Create a component registry:
```js
// In a new file or at APLFactory level:
const APL_COMPONENT_REGISTRY = {};
function registerAPLComponent(aplType, componentClass) {
    APL_COMPONENT_REGISTRY[aplType] = componentClass;
}
```
Register each component at definition time. Replace the switch statement with a registry lookup. Palette reads from the same registry.
**Test:** Verify all existing component types still load. Add test for registry lookup.
**Skill:** `apl-loader.md` and `apl-palette.md` — remove registration issues from Issues
**Commit:** `refactor(apl): centralized component type registry`

---

### 2.4 APLFactory: hardcoded component type names

**File:** `custom/APL/APLFactory.js:125,263-270`
**Issue:** `processElementAction()` checks `['APLTouchWrapper', 'APLText', 'APLImage'].includes(el.getAPLType())` and `initComponent()` switches on type strings. Should use component methods instead.
**Fix:** Add a method to APLComponent:
```js
// APLComponent
shouldCaptureClick() { return false; }
```
Override in APLTouchWrapper, APLText, APLImage to return `true`. Replace the includes check with `el.shouldCaptureClick()`. For `initComponent()`, rely on the registry from 2.3.
**Test:** Existing tests pass (behavioral equivalence). Add test verifying shouldCaptureClick().
**Skill:** `apl-factory.md` — remove "Hardcoded component names" from Issues
**Commit:** `refactor(apl-factory): use component methods instead of type string checks`

---

### 2.5 PropertyAdaptor: deep coupling chain in getTabs()

**File:** `custom/ObjectInspector/BestAppsPropertyAdaptor.js:47`
**Issue:** `this.getInspector().objectsSelectorComponent.tabsComponent.getTabs()` — 3 levels deep, violates Law of Demeter.
**Fix:** Add a `getTabs()` method on the inspector itself:
```js
// BestAppsObjectInspectorComponent
getTabs() {
    return this.objectsSelectorComponent?.tabsComponent?.getTabs() || [];
}
```
Then PropertyAdaptor becomes:
```js
getTabs() {
    return this.getInspector().getTabs();
}
```
**Test:** Existing inspector tests pass.
**Skill:** `property-adaptor.md` — remove "Deep coupling chain" from Issues
**Commit:** `refactor(property-adaptor): reduce coupling via inspector.getTabs()`

---

### 2.6 APLProperties: fragile `onCSSSet` iteration guard

**File:** `custom/APL/APLProperties.js:55,71`
**Issue:** `encode()` calls `properties.onCSSSet()` and `decode()` skips `key === 'onCSSSet'`. Both rely on the exact string. If renamed, both break silently.
**Fix:** Use a Symbol instead of a string key:
```js
// APLComponent.js
static ONCSSSET = Symbol('onCSSSet');

APLProperties = {
    ...
    [APLComponent.ONCSSSET]: () => { ... },
}
```
This is a larger refactor touching every component that defines `onCSSSet`. **Alternative (simpler):** extract `onCSSSet` from the properties object entirely — store it as a separate method `getOnCSSSet()` on the component. Properties become pure data.
**Test:** Full suite must pass after refactor.
**Skill:** `apl-properties.md` — remove "onCSSSet iteration guard" from Issues
**Commit:** `refactor(apl-properties): separate onCSSSet from property definitions`

---

### 2.7 JSONEditor icons broken in Shadow DOM

**File:** `custom/APL/ObjectInspector/tab/APLObjectInspectorDataTabComponent.js` (11 occurrences)
**Issue:** CSS `url("./custom/APL/vendor/jsoneditor/img/jsoneditor-icons.svg")` paths are relative to the document, but when rendered inside Shadow DOM the base URL context may differ, causing broken icons.
**Fix:** Replace relative paths with absolute paths from root:
```
url("/custom/APL/vendor/jsoneditor/img/jsoneditor-icons.svg")
```
**Test:** Visual verification (hard to autotest icon rendering). Add test that the SVG file is loadable via fetch.
**Skill:** `apl-inspector.md` — remove "JSONEditor icons broken in Shadow DOM" from Issues
**Commit:** `fix(apl-inspector): use absolute paths for jsoneditor icons in shadow DOM`

---

## Phase 3 — LOW: Cleanup & Skill Corrections

---

### 3.1 APLComponent: `onCSSSet` `this` binding — skill is wrong

**File:** `.claude/commands/apl-component.md`
**Issue:** The skill says `onCSSSet` arrow function captures `this` from class body evaluation context and may reference the wrong object. **This is incorrect** — class field initializers run in the constructor context, so `this` correctly refers to the instance. Subclasses get the right `this` because the field is initialized per-instance.
**Fix:** Skill correction only. Remove the incorrect issue.
**Test:** None needed — no code change.
**Skill:** `apl-component.md` — remove "onCSSSet this binding" from Issues, clarify in Pros that field initializer binding is correct
**Commit:** `docs(apl-component): correct onCSSSet this-binding description`

---

### 3.2 APLComponent: global event dispatch via `window.apl.publish()`

**File:** `custom/APL/APLComponent.js:280`
**Issue:** `setAPLParent()` calls `window.apl.publish()` for `EVENT_PARENT_CHANGED`. This is a design choice — the event needs to reach the global APL orchestrator. Converting to component-level pub/sub would require a reference to the APL instance, which is the same coupling by a different path.
**Fix:** Skill note only — document this as an intentional architectural decision, not a bug. The real fix would be a dependency injection refactor (out of scope).
**Test:** None needed.
**Skill:** `apl-component.md` — move from Issues to Cons with "intentional" note
**Commit:** `docs(apl-component): reclassify global event dispatch as architectural note`

---

### 3.3 APLScreen: MDN reference in file header

**File:** `custom/APL/APLScreen.js:1-3`
**Issue:** Header comment links to `Window.devicePixelRatio` but the code doesn't use it. Misleading.
**Fix:** Update the comment to describe what the class actually does.
**Test:** None needed.
**Skill:** `apl-screen.md` — remove "MDN reference" from Issues
**Commit:** `docs(apl-screen): fix misleading file header comment`

---

### 3.4 APLDialogs: fixed positioning in Shadow DOM

**File:** `.claude/commands/apl-dialogs.md`
**Issue:** Skill notes `position: fixed` may not work in Shadow DOM if an ancestor has `transform`/`filter`/`perspective`. This is a real CSS limitation but **cannot be fixed in this component** — it's a browser behavior. The fix would be to render dialogs outside the shadow DOM (e.g., in a top-level portal), which is a significant architectural change.
**Fix:** Skill note only — reclassify as a known limitation, not a fixable issue.
**Test:** None needed.
**Skill:** `apl-dialogs.md` — move from Issues to Cons as a known limitation
**Commit:** `docs(apl-dialogs): reclassify fixed positioning as known limitation`

---

### 3.5 APLTouchWrapper: events are data-only

**File:** `.claude/commands/apl-touchwrapper.md`
**Issue:** `onPress`, `onFocus`, etc. are stored as command arrays but never connected to DOM event listeners. This is **by design** — this is an APL document editor, not a runtime. The events are for authoring, not execution.
**Fix:** Skill correction only — reclassify as a design note.
**Test:** None needed.
**Skill:** `apl-touchwrapper.md` — move from Issues to a note explaining editor vs. runtime distinction
**Commit:** `docs(apl-touchwrapper): clarify events are authoring data, not runtime handlers`

---

### 3.6 APLTouchWrapper: unnecessary custom element registrations — skill is wrong

**File:** `.claude/commands/apl-touchwrapper.md`
**Issue:** Skill says APLActionableComponent and APLTouchableComponent are registered with `customElements.define`. **This is incorrect** — neither has a `customElements.define` call. They are abstract classes used only via inheritance.
**Fix:** Skill correction only — remove the incorrect issue.
**Test:** None needed.
**Skill:** `apl-touchwrapper.md` — remove "Unnecessary custom element registrations" from Issues
**Commit:** `docs(apl-touchwrapper): remove incorrect custom element registration claim`

---

### 3.7 ObjectPalette: APL coupling comment

**File:** `.claude/commands/object-palette.md`
**Issue:** Skill flags `//TODO: looks like its APL` as an issue. It's a developer note, not a bug. The palette is intentionally generic.
**Fix:** Skill correction only — reclassify as a code comment observation.
**Test:** None needed.
**Skill:** `object-palette.md` — remove from Issues
**Commit:** `docs(object-palette): remove TODO comment from issues list`

---

### 3.8 APLProperties: decode deep clone breaks functions

**File:** `custom/APL/APLProperties.js:94`
**Issue:** `JSON.parse(JSON.stringify(property))` drops function values. Currently the only function in properties is `onCSSSet` which is already skipped by the `key === 'onCSSSet'` guard. So this doesn't cause actual breakage today.
**Fix:** If 2.6 (separate onCSSSet) is done first, this becomes moot. Otherwise, add a structured clone that preserves functions:
```js
const copy = {};
for (const k of Object.keys(property)) {
    copy[k] = typeof property[k] === 'object' ? JSON.parse(JSON.stringify(property[k])) : property[k];
}
```
**Test:** Existing tests.
**Skill:** `apl-properties.md` — update after fix
**Commit:** `fix(apl-properties): preserve non-JSON values in decode deep clone`

---

### 3.9 AppYearMonth: year range navigation — skill is wrong

**File:** `.claude/commands/app-year-month.md`
**Issue:** Skill says "range sizes change from 10 to 9 items on navigation". **This is incorrect** — the range is consistently 9 items: initial `(year+5)-(year-4)=9`, `<` navigation `(start+1)-(start-8)=9`, `>` navigation `(end+8)-(end-1)=9`.
**Fix:** Skill correction only — remove the incorrect issue.
**Test:** None needed.
**Skill:** `app-year-month.md` — remove "Year range navigation" from Issues
**Commit:** `docs(app-year-month): remove incorrect year range navigation issue`

---

## Execution Order

```
Phase 1 (HIGH - Bugs):
  1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
  Each: fix → test → update skill → update progress → commit

Phase 2 (MEDIUM - Architecture):
  2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7
  Each: fix → test → update skill → update progress → commit

Phase 3 (LOW - Skill corrections):
  3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8 → 3.9
  Each: update skill → update progress → commit (code changes only where noted)
```

## Estimated Effort

| Phase | Items | Effort | Risk |
|-------|-------|--------|------|
| 1 | 6 | ~2 hours | Low — isolated fixes |
| 2 | 7 | ~5 hours | Medium — refactors touching multiple files, registry is the biggest |
| 3 | 9 | ~1 hour | None — mostly skill text corrections |
| **Total** | **19** | **~8 hours** | |

---

## Progress Tracker

| ID  | Description                                        | Status  | Date | Commit  |
|-----|----------------------------------------------------|---------|------|---------|
| 1.1 | APLText dead CSS properties not mapped              | done    | 2026-06-01 | pending-commit |
| 1.2 | APLDom removed nodes not cleaned up                 | done    | 2026-06-01 | pending-commit |
| 1.3 | APLDom inconsistent child access                    | done    | 2026-06-01 | pending-commit |
| 1.4 | APL missing null checks in onTabChange              | done    | 2026-06-01 | pending-commit |
| 1.5 | PropertyAdaptor setTimeout race condition           | done    | 2026-06-01 | pending-commit |
| 1.6 | APLDialogs missing Escape key handler               | done    | 2026-06-01 | pending-commit |
| 2.1 | APLLoader global scheme variable dependency         | pending |      |         |
| 2.2 | APLLoader script tag leak on refresh                | pending |      |         |
| 2.3 | APLLoader + APLPalette no dynamic registration      | pending |      |         |
| 2.4 | APLFactory hardcoded component type names            | pending |      |         |
| 2.5 | PropertyAdaptor deep coupling chain                 | pending |      |         |
| 2.6 | APLProperties fragile onCSSSet iteration guard      | pending |      |         |
| 2.7 | JSONEditor icons broken in Shadow DOM               | pending |      |         |
| 3.1 | Skill correction: onCSSSet this binding is correct  | pending |      |         |
| 3.2 | Skill correction: global dispatch is intentional    | pending |      |         |
| 3.3 | Skill correction: APLScreen MDN header comment      | pending |      |         |
| 3.4 | Skill correction: dialog fixed positioning caveat   | pending |      |         |
| 3.5 | Skill correction: touchwrapper events are by design | pending |      |         |
| 3.6 | Skill correction: no unnecessary registrations      | pending |      |         |
| 3.7 | Skill correction: palette APL coupling comment      | pending |      |         |
| 3.8 | APLProperties decode deep clone breaks functions    | pending |      |         |
| 3.9 | Skill correction: year range is consistently 9      | pending |      |         |
