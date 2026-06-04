# Plan: Fix Documented Cons & Expand Test Coverage

## Context

The `.claude/commands/*.md` files document ~100 Cons across 25 components. A deep audit found:
- **4 Cons are INACCURATE** (code doesn't match what the doc claims)
- **1 Con is ALREADY FIXED** (code was improved but doc wasn't updated)
- **~95 Cons remain VALID** — ranging from real bugs to missing features

The project has 18 E2E test files (WebdriverIO + Mocha) but ~17 source modules have no dedicated tests. Existing tests primarily verify property presence and component rendering, but rarely test CSS application, encoding/decoding, edge cases, or the bugs documented in the Cons.

---

## Phase 1: Fix Inaccurate/Stale Documentation (5 files)

Update the Cons sections to reflect the actual code state. No code changes.

| File | Con to Fix | Action |
|------|-----------|--------|
| `apl-factory.md` | "XSS vulnerability in initComponent()" | **Remove** — `initComponent()` uses safe APIs (`textContent`, `img.src`, `replaceChildren`), not innerHTML with user data |
| `apl-component.md` | "onCSSSet defined as arrow function in property literal" | **Remove** — `onCSSSet()` is a proper class method (line 110) |
| `apl-container.md` | "Doesn't inherit position/alignment properties" | **Remove** — lines 72-73 explicitly merge `getContainerProperties()` and `getAlignmentAndPositioningProperties()` |
| `apl-touchwrapper.md` | "APLActionableComponent and APLTouchableComponent are registered as custom elements" | **Remove** — neither calls `customElements.define()`. Design Notes already clarify this. |
| `property-adaptor.md` | "setComponent() uses setTimeout(..., 1)" | **Update** — code now uses `requestAnimationFrame` (line 33). Mark as fixed or remove. |

---

## Phase 2: Fix Real Bugs (code changes, priority order)

### P0 — Logic Bugs

**2a. `APLCommand.getOther()` — inverted logic**
- File: `custom/APL/ObjectInspector/command/APLCommand.js:59-71`
- Bug: Iterates `Object.keys(this.getAll())` but should iterate `Object.keys(this.props)` to find properties NOT in the standard set. The `if(this.props[prop]) continue` guard uses truthiness (skips truthy, includes falsy) instead of `hasOwnProperty`.
- Fix: Iterate `this.props` keys, skip those present in `this.getAll()`, set `default` from `this.props[key]` (not the filtered-out value).

**2b. `APLProperties.getContainerProperties()` — invalid `sticky` position**
- File: `custom/APL/APLProperties.js:~142`
- Bug: `sticky` is not a valid APL position value (only `relative` and `absolute` are).
- Fix: Remove `sticky` from the items list.

### P1 — Missing Cleanup / Resource Leaks

**2c. `APLComponent` — no `disconnectedCallback`**
- File: `custom/APL/APLComponent.js`
- Bug: Event listeners attached by APLFactory (dragstart, drop, dragover, click) and pub/sub subscriptions are never cleaned up when a component is removed from DOM.
- Fix: Add `disconnectedCallback()` that removes event listeners and unsubscribes from pub/sub. Store listener references during attachment.

### P2 — Data Integrity

**2d. `APLDom.findByGuid()` — O(n) recursive search**
- File: `custom/APL/APLDom.js:68-81`
- Fix: Add a `Map<guid, node>` index. Update it in `addByComponent()`, `removeByGuid()`, and `move()`. Keep `findByGuid()` as fallback.

**2e. `APLDom.getChildrenFlatList()` — checks both `item.items` and `item.item`**
- File: `custom/APL/APLDom.js` (via `getNodeChildren`)
- Fix: Standardize to always use `items` (plural). Remove `item.item` fallback if unused elsewhere.

### P3 — Type Correctness

**2f. `APLTextComponent` — `color` typed as `text` instead of `color`**
- File: `custom/APL/APLTextComponent.js`
- Fix: Change property type to `color` so the inspector shows a color picker.

**2g. `APLImageComponent` — `sources` and `borderRadius` typed wrong**
- File: `custom/APL/APLImageComponent.js`
- Fix: `sources` → type `text` (or custom array editor), `borderRadius` → type `dimension`.

**2h. `APLCommand.generateUid()` — duplicated from BestAppsComponent**
- File: `custom/APL/ObjectInspector/command/APLCommand.js:55-57`
- Fix: Import and reuse `generateUid` from a shared utility instead of duplicating.

---

## Phase 3: New E2E Tests (WebdriverIO)

Tests use the existing pattern: HTML fixture in `tests/fixtures/`, test file in `tests/specs/`, reuse helpers from `tests/helpers/Component.ts`.

### 3a. Tests for Fixed Bugs (regression tests)

| Test File | What to Test |
|-----------|-------------|
| `apl-commands.test.ts` (extend) | `getOther()` returns only non-standard props; falsy values like `0` and `""` are included correctly |
| `apl-component.test.ts` (extend) | `disconnectedCallback` cleans up subscriptions; component removal doesn't leak listeners |
| `apl-frame.test.ts` (extend) | CSS actually applied: `borderWidth` with units, `borderRadius` rendering, `borderColor` to wrapper |

### 3b. New Test Files for Untested Modules

| New Test File | Target Module | Key Test Cases |
|--------------|---------------|----------------|
| `apl-properties.test.ts` | `APLProperties.js` | `encode()`: CSS key mapping, dp conversion, list property handling. `decode()`: round-trip fidelity, special type handling. `getContainerProperties()`: position values valid (no `sticky`). |
| `apl-dom.test.ts` | `APLDom.js` | `addByComponent`: builds tree hierarchy. `findByGuid`: finds nested items, returns undefined for missing. `removeByGuid`: updates parent items. `move()`: re-parents correctly, handles null. `getChildrenFlatList`: consistent property access. |
| `apl-loader.test.ts` | `APLLoader.js` | Loads APL JSON, creates correct component types. Unknown types produce console.warn. Missing schema handling. |
| `apl-palette.test.ts` | `APLPalette.js` | Palette populates with expected component types. `create()` returns a component with correct tag/type attributes. |
| `apl-dialogs.test.ts` | Dialog components | Dialog opens/closes. Confirm dialog callback fires on OK/Cancel. Escape key closes (once implemented). |
| `apl-factory.test.ts` | `APLFactory.js` | `copyFromTag` creates and appends component. `clone` duplicates with new GUID. Selection (`onSelect`) fires on click. Drag-drop event wiring. |
| `property-adaptor.test.ts` | `BestAppsPropertyAdaptor.js` | `update()` pushes component+tabs. `onTabChange` fires on property edit. `onComponentChange` fires on dropdown switch. |

### 3c. Extend Existing Tests for Cons Coverage

| Existing Test | Extend With |
|---------------|-------------|
| `apl-text.test.ts` | Verify CSS actually applied: `fontSize` → `font-size` on wrapper, `fontWeight` → `font-weight`, `color` → element color. Test `auto` height calculation. |
| `apl-image.test.ts` | Verify `source` property sets `img.src`. Test `scale` → `object-fit` CSS mapping. |
| `apl-screen.test.ts` | Verify `getSizePixels()` conversions. Test resolution dropdown changes update canvas size. |
| `apl-touchwrapper.test.ts` | Verify `onCSSSet` dp conversion for width/height. |
| `apl-scrollview.test.ts` | Verify position/alignment properties if added. |
| `apl-edittext.test.ts` | Verify input element renders, value property binds. |
| `app-year-month.test.ts` | Test popup positioning within viewport. Month selection dispatches change. |
| `object-inspector.test.ts` | Test property activation on rapid clicks. |
| `object-palette.test.ts` | Test `generateElementId` when type is null. |

---

## Phase 4: Update Cons Documentation

After code fixes and tests pass, update each `.claude/commands/*.md` to:
- Remove fixed Cons
- Add any newly-discovered issues
- Mark feature-gap Cons (missing APL types, i18n, etc.) as "Feature Gap" vs "Bug"

---

## Execution Order

1. **Phase 1** — Doc fixes (quick, no risk)
2. **Phase 2a-2b** — Logic bug fixes + regression tests
3. **Phase 3a** — Regression tests for bugs
4. **Phase 2c-2h** — Remaining code fixes
5. **Phase 3b** — New test files for untested modules
6. **Phase 3c** — Extend existing tests
7. **Phase 4** — Final doc cleanup

---

## Verification

- Run full test suite: `npx wdio tests/wdio.conf.js`
- Run headed for visual check: `WDIO_HEADED=true npx wdio tests/wdio.conf.js`
- Run single test: `npx wdio tests/wdio.conf.js --spec tests/specs/<name>/<name>.test.ts`
- All existing tests must continue to pass (no regressions)
- Each bug fix should have at least one test that would have caught the bug
