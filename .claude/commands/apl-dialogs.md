# APL Dialogs

Describe the APLDialogComponent and APLConfirmDialogComponent based on the following analysis.

## Overview

**APLDialogComponent** (`custom/APL/Dialogs/APLDialogComponent.js`) is a generic modal dialog component extending `APLComponent`. It provides a fullscreen overlay with centered content area and action buttons.

**APLConfirmDialogComponent** (`custom/APL/Dialogs/APLConfirmDialogComponent.js`) extends the base dialog to add a Confirm button for yes/no decisions.

## Tags
- `<apl-dialog-component>` (APLDialogComponent)
- `<apl-confirm-dialog-component>` (APLConfirmDialogComponent)

## APLDialogComponent

### Behavior
- Initially hidden (`display: none`)
- `show(data)` waits for `loadedDefer` then shows with `display: block` via `.active` class
- Click on overlay closes the dialog
- Click on wrapper content area stops propagation (doesn't close)
- Close button calls `doClose()` -> `onClose()` -> `doDone()`

### Lifecycle Hooks (override points)
- `onClose()` - called when closing
- `onDone()` - called after close/success
- `onSuccess()` - called on successful action (confirm)

### Style
- Full viewport overlay with semi-transparent black background
- Centered white content area (50% width, 50vh height)
- Flex column layout with content area and action buttons

## APLConfirmDialogComponent

Adds:
- Confirm button alongside the Close button
- `doConfirm()` -> `onConfirm()` -> `doSuccess()` -> `onSuccess()` -> `doDone()`
- Smaller size: 200px width, auto height

### Usage Pattern
```js
this.dialog = document.createElement(APLConfirmDialogComponent.tag);
this.element.wrapper.appendChild(this.dialog);
this.dialog.show({ content: 'Are you sure?' });
this.dialog.onSuccess = () => { /* handle confirm */ };
```

## Pros
- Clean separation of dialog types (base vs. confirm)
- Overlay click-to-close is standard UX
- `loadedDefer` ensures dialog is fully initialized before showing
- Callback hooks (`onClose`, `onSuccess`, `onDone`) allow flexible behavior customization
- Content is passed as parameter, keeping the component generic

## Cons
- Extends `APLComponent` but is not an APL component - should extend `BestAppsComponent` instead
- Callbacks set as instance properties (`dialog.onSuccess = () => {}`) instead of events - only one handler possible
- Dialog is appended inside the component's shadow DOM wrapper, so its `position: fixed` may be relative to the shadow host, not the viewport (CSS containment issue)
- No keyboard support (Escape to close, Enter to confirm)
- No focus trapping - user can tab to elements behind the dialog
- `onAfterRefresh()` called in `initElements()` without `await` - timing issue

## Issues
- **Fixed positioning in Shadow DOM**: `position: fixed` inside a Shadow DOM may not behave as expected if any ancestor has `transform`, `filter`, or `perspective` set. This is a known browser limitation, not fixable in the component
