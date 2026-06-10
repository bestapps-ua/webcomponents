# E2E Testing — Page & Component Patterns

Two patterns are used:
- **Component pattern** — for single web components. Uses fixture classes from `tests/helpers/components/`. See the **testing-fixtures** skill for full class API and SOLID/DRY/KISS design rationale.
- **Page pattern** — for non-component classes or multi-component integration.

---

## Component Pattern

### Fixture Classes

Located in `tests/helpers/components/` (one file per class). Re-exported via `tests/helpers/Component.ts` barrel.

```
ComponentFixture           — base: open(), el(), wrapper(), guid(), hasClass(), testRenders()
  └─ AsyncFixture          — custom readiness flag instead of `loaded` attribute
```

### Component Test Template

```ts
import { ComponentFixture } from '../../helpers/Component';

const fixture = new ComponentFixture('/tests/fixtures/<name>.html', '#element-id');

describe('ComponentName', () => {
    before(() => fixture.open());
    fixture.testRenders();  // render + guid + shadow + loaded
    // ...custom tests...
});
```

### Fixture HTML (Component)

Same structure as Page fixtures, but include the component's `<script>` tags and place the custom element in the DOM:

```html
<body>
<script src="/BestAppsComponent.js"></script>
<script src="/custom/ObjectInspector/MyComponent.js"></script>
<my-component id="el1" name="Test1"></my-component>
</body>
```

No `window._testReady` needed — `ComponentFixture.open()` waits for the `loaded` attribute automatically.

### Key Rules (Component)

- Fixture class methods like `testRenders()` are called at **describe scope** (not inside `it()`). They register `it()` blocks internally.
- Use `ComponentFixture` for standard components, `AsyncFixture` when the component needs a custom readiness check.
- All `browser.execute()` serialization rules apply (see Page pattern below).

### Component Examples

| Test | Fixture | What it tests |
|---|---|---|
| `app-year-month.test.ts` | `ComponentFixture` | Year-month picker, selectors, getters |
| `bestapps-component.test.ts` | `ComponentFixture` | Base component rendering |
| `object-inspector.test.ts` | `AsyncFixture` | Inspector UI, tabs, property editing |
| `object-palette.test.ts` | `AsyncFixture` | Palette UI, drag source |

---

## Page Pattern

Use this pattern for testing **non-component classes** or **multi-component integration** scenarios.

## Stack

- **Runner**: WebdriverIO (wdio) + Mocha BDD
- **Server**: Static HTTP (`tests/helpers/server.js`) on port 8090
- **Config**: `tests/wdio.conf.js`

## File Structure

```
tests/
  fixtures/<name>.html       ← page fixture (scripts + DOM + setup)
  specs/<name>/<name>.test.ts ← test file
```

## Fixture HTML Template

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Test Title</title></head>
<body>
<!-- 1. Load scripts in dependency order (no bundler) -->
<script src="/utils/uid.js"></script>
<script src="/BestAppsComponent.js"></script>
<!-- ...additional scripts as needed... -->

<!-- 2. DOM scaffolding (optional) -->
<div id="container"></div>

<!-- 3. Setup + readiness signal -->
<script>
window.addEventListener('load', async () => {
    // Build objects, wire them together
    const myObj = new SomeClass({ ... });

    // Expose on window._ for test access
    window._myObj = myObj;

    // REQUIRED: signal fixture is ready
    window._testReady = true;
});
</script>
</body>
</html>
```

### Key rules

- Scripts are loaded via `<script src="/...">` relative to project root (the static server serves from project root).
- Order matters — load dependencies before dependents.
- Expose test objects on `window._` prefix (underscore convention).
- Set `window._testReady = true` **last**, after all async setup completes.

## Test File Template

```ts
import { browser, expect } from '@wdio/globals';

describe('ClassName', () => {
    before(async () => {
        await browser.url('/tests/fixtures/<name>.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testReady),
            { timeout: 5000 },
        );
    });

    it('should do something', async () => {
        const result = await browser.execute(() => {
            const obj = (window as any)._myObj;
            return obj.someMethod();
        });
        expect(result).toBe(expectedValue);
    });
});
```

### Key rules

- **All logic runs inside `browser.execute()`** — it runs in the browser context, not Node.
- Cast `window` as `(window as any)` to access `_`-prefixed properties.
- `browser.execute` serializes return values via JSON — `undefined` becomes `null`, functions are lost.
- For boolean checks on potentially-undefined values, use `!!value` inside execute and test with `toBe(true/false)`.

## When to Use Page vs Component

| Scenario | Pattern |
|---|---|
| Single web component (properties, events, rendering) | **Component** — `ComponentFixture` |
| Multi-component interaction | **Page** |
| CSS verification on a component | **Component** + `browser.execute` for style checks |

## Running Tests

```bash
# Full suite
npx wdio tests/wdio.conf.js

# Single spec
npx wdio tests/wdio.conf.js --spec tests/specs/<name>/<name>.test.ts

# Headed (visible browser)
WDIO_HEADED=true npx wdio tests/wdio.conf.js
```
