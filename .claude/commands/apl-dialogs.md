# APL Dialogs

Describe the APLDialogComponent and APLConfirmDialogComponent based on the following analysis.

## Overview

**APLDialogComponent** (`custom/APL/Dialogs/APLDialogComponent.js`) is a generic modal dialog component extending `APLComponent`. It uses the native `<dialog>` element with `showModal()` for top-layer rendering — the dialog always covers the full viewport regardless of ancestor `transform`, `filter`, or `perspective` CSS.

**APLConfirmDialogComponent** (`custom/APL/Dialogs/APLConfirmDialogComponent.js`) extends the base dialog to add a Confirm button for yes/no decisions.

## Tags
- `<apl-dialog-component>` (APLDialogComponent)
- `<apl-confirm-dialog-component>` (APLConfirmDialogComponent)

## APLDialogComponent

### Behavior
- Uses native `<dialog>` element inside Shadow DOM with `showModal()` for top-layer rendering
- `show(data)` waits for `loadedDefer` then opens via `dialogElement.showModal()`
- Click on overlay area (outside content box) closes the dialog
- Click on wrapper content area stops propagation (doesn't close)
- Escape key closes via native `cancel` event (browser-provided)
- Focus trapping is automatic (native `<dialog>` behavior)
- Close button calls `doClose()` -> `onClose()` -> `doDone()`

### DOM Structure
```
apl-dialog-component (custom element)
  └── #shadow-root
      └── style
      └── dialog (native, shown via showModal())
          └── div.wrapper (centered content box)
              └── div.content
              └── div.actions
```

### Lifecycle Hooks (override points)
- `onClose()` - called when closing
- `onDone()` - called after close/success
- `onSuccess()` - called on successful action (confirm)

### Style
- `<dialog>` fills viewport (transparent, padding: 0, border: none)
- `::backdrop` provides semi-transparent black overlay
- `.wrapper` is centered white content area (50% width, 50vh height)
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
- Uses native `<dialog>` with `showModal()` — renders in browser top layer, immune to ancestor CSS containment
- Focus trapping provided by browser (native `<dialog>` behavior)
- Escape key handled via native `cancel` event — no manual keydown listener needed
- `::backdrop` pseudo-element provides the overlay — no manual fixed-position overlay
- Clean separation of dialog types (base vs. confirm)
- Overlay click-to-close is standard UX
- `loadedDefer` ensures dialog is fully initialized before showing
- Callback hooks (`onClose`, `onSuccess`, `onDone`) allow flexible behavior customization

## Cons
- Extends `APLComponent` but is not an APL component - should extend `BestAppsComponent` instead
- Callbacks set as instance properties (`dialog.onSuccess = () => {}`) instead of events - only one handler possible
- New dialog instance created on each open (not reused) — accumulates in DOM

## Issues
- None currently tracked
