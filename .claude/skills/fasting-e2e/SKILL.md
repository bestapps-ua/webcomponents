# E2E Testing — Page & Component Patterns

Two patterns are used:
- **Component pattern** — for single web components. Uses fixture classes from `tests/helpers/components/`. See the **testing-fixtures** skill for full class API and SOLID/DRY/KISS design rationale.
- **Page pattern** — for non-component classes (APLDom, APLProperties, APLCommand) or multi-component integration.

---

## Component Pattern

### Fixture Classes

Located in `tests/helpers/components/` (one file per class). Re-exported via `tests/helpers/Component.ts` barrel.

```
ComponentFixture           — base: open(), el(), wrapper(), guid(), hasClass(), testRenders()
  └─ APLComponentFixture   — APL: propertyKeys(), propertyDef(), eventKeys(), aplName(), aplType(),
  │                          testBase(), testHasProperties(), testHasEvents(),
  │                          testPropertyType(), testPropertyDefault(), testPositionProperties()
  └─ AsyncFixture          — custom readiness flag instead of `loaded` attribute
```

### Component Test Template

```ts
import { browser } from '@wdio/globals';
import { APLComponentFixture } from '../../helpers/Component';

const fixture = new APLComponentFixture('/tests/fixtures/<name>.html', '#element-id');

describe('ComponentName', () => {
    before(() => fixture.open());

    // Declarative test methods — called at describe scope, they register `it()` blocks internally
    fixture.testBase();                              // renders + guid + shadow + loaded + apl-component class + base props
    fixture.testHasProperties(['prop1', 'prop2']);    // asserts property keys exist
    fixture.testHasEvents(['onPress', 'onBlur']);     // asserts event keys exist
    fixture.testPropertyType('color', 'color');       // asserts property type
    fixture.testPropertyDefault('opacity', '1');      // asserts property default value
    fixture.testPositionProperties();                 // shorthand for position/left/top/right/bottom

    // Custom tests
    it('should do something specific', async () => {
        const result = await browser.execute(() => {
            const el = document.getElementById('element-id') as any;
            return el.someMethod();
        });
        expect(result).toBe(expected);
    });
});
```

### Non-APL Component Test Template

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
<script src="/custom/APL/APLComponent.js"></script>
<script src="/custom/APL/MyComponent.js"></script>
<my-component id="el1" name="Test1"></my-component>
</body>
```

No `window._testReady` needed — `ComponentFixture.open()` waits for the `loaded` attribute automatically.

### Key Rules (Component)

- Fixture class methods like `testBase()` and `testHasProperties()` are called at **describe scope** (not inside `it()`). They register `it()` blocks internally.
- Use `APLComponentFixture` for APL components, `ComponentFixture` for non-APL, `AsyncFixture` when the component needs a custom readiness check.
- All `browser.execute()` serialization rules apply (see Page pattern below).

### Component Examples

| Test | Fixture | What it tests |
|---|---|---|
| `apl-component.test.ts` | `APLComponentFixture` | Base APL component rendering, properties, events, pub/sub |
| `apl-container.test.ts` | `APLComponentFixture` | Container properties, direction, child management |
| `apl-frame.test.ts` | `APLComponentFixture` | Frame border/background properties, onCSSSet |
| `apl-text.test.ts` | `APLComponentFixture` | Text color type, font properties |
| `apl-image.test.ts` | `APLComponentFixture` | Image scale/align, borderRadius dimension type |
| `apl-touchwrapper.test.ts` | `APLComponentFixture` | Touch events, position props, CSS sizing |
| `apl-scrollview.test.ts` | `APLComponentFixture` | Scroll events, overflow styling |
| `apl-edittext.test.ts` | `APLComponentFixture` | Input rendering, text/color properties |
| `apl-document.test.ts` | `ComponentFixture` | Document rendering, layout, background |
| `app-year-month.test.ts` | `ComponentFixture` | Year-month picker, selectors, getters |
| `bestapps-component.test.ts` | `ComponentFixture` | Base component rendering |

---

## Page Pattern

Use this pattern for testing **non-component classes** (APLDom, APLProperties, APLCommand, APLFactory, BestAppsPropertyAdaptor) or **multi-component integration** scenarios.

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
<script src="/utils/APLComponentRegistry.js"></script>
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
- Order matters — load dependencies before dependents (e.g., `BestAppsComponent.js` before `APLComponent.js`).
- Expose test objects on `window._` prefix (underscore convention).
- Set `window._testReady = true` **last**, after all async setup completes.

### Error capture (for integration tests)

Add this block before the `load` listener to catch errors in tests:

```html
<script>
window._consoleErrors = [];
const origError = console.error;
console.error = function() {
    window._consoleErrors.push(Array.from(arguments).map(String).join(' '));
    origError.apply(console, arguments);
};
window._unhandledErrors = [];
window.addEventListener('unhandledrejection', (e) => {
    window._unhandledErrors.push(e.reason?.message || String(e.reason));
});
</script>
```

Then assert at the end of the test suite:

```ts
it('should have no unhandled errors', async () => {
    const errors = await browser.execute(() => (window as any)._unhandledErrors);
    expect(errors).toHaveLength(0);
});

it('should have no console errors', async () => {
    const errors = await browser.execute(() => (window as any)._consoleErrors);
    const relevant = errors.filter(
        (e: string) => !e.includes('favicon') && !e.includes('[deprecation]'),
    );
    expect(relevant).toHaveLength(0);
});
```

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
            // interact with the object
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
- For existence checks, prefer `!!obj` over checking for `undefined`/`null` (serialization issue).
- To check a return value is missing, use `toBeFalsy()` or `toBe(false)` with `!!` wrapper — never `toBeUndefined()`.

## When to Use Page vs Component

| Scenario | Pattern |
|---|---|
| Single web component (properties, events, rendering) | **Component** — `APLComponentFixture` |
| Plain JS class (APLDom, APLCommand, APLProperties) | **Page** |
| Multi-component interaction (drag-drop, inspector wiring) | **Page** |
| Dialog/modal behavior (show/hide, escape, click-outside) | **Page** |
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

## Examples

| Test | Fixture | Pattern | What it tests |
|---|---|---|---|
| `apl-commands.test.ts` | `apl-commands.html` | Page | APLCommand class methods, getOther() |
| `apl-dom.test.ts` | `apl-dom.html` | Page | Tree operations, GUID index, getNodeChildren |
| `apl-properties.test.ts` | `apl-properties.html` | Page | encode/decode, getContainerProperties |
| `apl-dialog.test.ts` | `apl-dialog.html` | Page | Dialog show/hide, escape, click-outside, transforms |
| `apl-decoupled.test.ts` | `apl-decoupled.html` | Page | Full integration without globals |
