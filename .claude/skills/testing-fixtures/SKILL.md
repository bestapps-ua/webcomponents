# Test Fixture Classes

Component test fixtures live in `tests/helpers/components/`. Each class encapsulates all component interaction — test files should never use raw `browser.execute()`.

## File Structure

```
tests/helpers/
  Component.ts                          ← barrel re-export
  components/
    index.ts                            ← barrel re-export
    ComponentFixture.ts                 ← base: any web component
    AsyncFixture.ts                     ← custom readiness flag
    BestAppsComponentFixture.ts         ← pub/sub, options, dynamic creation
    AppYearMonthFixture.ts              ← year-month picker interaction
    ObjectPaletteFixture.ts             ← palette items, drag, types
    ObjectInspectorFixture.ts           ← inspector tabs, components
```

## Hierarchy

```
ComponentFixture
├── BestAppsComponentFixture
├── AppYearMonthFixture
└── AsyncFixture
    ├── ObjectPaletteFixture
    └── ObjectInspectorFixture
```

## Design: SOLID / DRY / KISS

- **S**: One file = one class = one component
- **O**: Extend parent without modifying it; new components = new files
- **L**: Any subclass works wherever its parent is expected
- **I**: Tests import only the fixture they need
- **D**: Tests call typed fixture methods, never raw `browser.execute()`
- **DRY**: Shared accessors (`wrapperStyle`, `hasShadowElement`, `hasMethod`) in base classes
- **KISS**: Plain inheritance, barrel re-export, no factories or DI

## ComponentFixture — Base

| Method | Returns | Purpose |
|---|---|---|
| `open()` | `void` | Navigate + wait for `loaded` |
| `waitForLoaded()` | `void` | Wait for `loaded="loaded"` |
| `el()` | `Element` | Get element by selector |
| `wrapper()` | `Element` | Get shadow `.wrapper` |
| `shadowEl(selector)` | `Element` | Get any shadow DOM element |
| `guid()` | `string` | Get `guid` attribute |
| `getAttribute(name)` | `string` | Get any attribute |
| `getSize()` | `{width, height}` | Get element dimensions |
| `click()` | `void` | Click the element |
| `hasClass(name)` | `boolean` | Check classList |
| `wrapperStyle(prop)` | `string` | Computed style of `.wrapper` |
| `hasShadowElement(sel)` | `boolean` | Element exists in shadow DOM |
| `hasMethod(name)` | `boolean` | Check if method exists on element |
| `testRenders()` | — | Register 4 `it()`: render, guid, shadow, loaded |

## AsyncFixture — Custom Readiness

Constructor: `(path, selector, readyFlag)`. `open()` waits for `window[readyFlag]` before `loaded`.

## Per-Component API

### BestAppsComponentFixture

| Method | Returns | Purpose |
|---|---|---|
| `getOptions()` | `object` | Component options |
| `isDebug()` | `boolean` | Debug option enabled |
| `subscribePubSub(event, data)` | `T` | Subscribe + publish, get received data |
| `subscribeOnceCount(event, times)` | `number` | Subscribe once, publish N times, get call count |
| `createDynamic(tag, id, containerId)` | `Fixture` | Create element, return loaded fixture |
| `testBestAppsBase()` | — | testRenders() + ba-component class |

### AppYearMonthFixture

| Method | Returns | Purpose |
|---|---|---|
| `getYear()` / `getMonth()` | `number` / `string` | Year/month values |
| `getSelectorDisplay(component)` | `string` | Display state of sub-selector |
| `shadowInput()` | `Element` | The shadow input element |
| `clickInput()` | `void` | Click the input |
| `getInputValue()` | `string` | Current input value |
| `isInputReadOnly()` | `boolean` | Input readonly state |

### ObjectPaletteFixture (extends AsyncFixture)

| Method | Returns | Purpose |
|---|---|---|
| `getComponentCount()` | `number` | Palette item count |
| `findByType(type)` | `boolean` | Component exists by type |
| `getComponentTexts()` | `string[]` | Text of all items |
| `isDraggable(index)` | `boolean` | Item is draggable |

### ObjectInspectorFixture (extends AsyncFixture)

| Method | Returns | Purpose |
|---|---|---|
| `getComponentCount()` | `number` | Registered component count |
| `getCurrentComponentName()` | `string` | Current component name |
| `hasObjectsSelector()` | `boolean` | Objects selector exists |
| `getTabNames()` | `string[]` | All tab names |

## Usage

```ts
import { ComponentFixture } from '../../helpers/Component';

const fixture = new ComponentFixture('/tests/fixtures/my-component.html', '#my1');

describe('MyComponent', () => {
    before(() => fixture.open());

    fixture.testRenders();

    it('should have some behavior', async () => {
        // custom assertions
    });
});
```

## Adding a New Component Fixture

1. Create `tests/helpers/components/MyFixture.ts`
2. Extend the correct parent class
3. Add **accessor methods** for reading component state
4. Add **interaction methods** for clicking, typing, triggering
5. Add a `testMyComponent()` method for standard assertions
6. Export from `components/index.ts` and `Component.ts`
7. Test file should have **zero** `browser.execute()` calls

## Key Constraints

- `test*()` methods: called at **describe scope**, register `it()` blocks internally
- `getStyle(prop)`: uses camelCase (`'borderWidth'`, not `'border-width'`)
- `browser.execute()` serialization: `undefined` → `null`, functions lost
- CSS values: `'200dp'` rejected by browsers — use `'200px'`
- Boolean checks: use `!!value` inside execute, then `toBe(true/false)`
