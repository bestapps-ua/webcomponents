# APLEditTextComponent

Describe the APLEditTextComponent based on the following analysis.

## Overview

`APLEditTextComponent` (`custom/APL/APLEditTextComponent.js`) represents the APL EditText component - a text input field. It extends `APLActionableComponent` and adds `text` and `color` properties. Like ScrollView, it is a minimal implementation.

## Tag: `<apl-edit-text-component>`

## APL Reference
https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-edittext.html

## Additional Properties

| Property | Type | CSS Mapping | Notes |
|---|---|---|---|
| `text` | text | - | Placeholder or initial text |
| `color` | color | - | Text color (no CSS mapping) |

## Implementation

Extends `APLActionableComponent`, adds `text` and `color` properties. Renders a native `<input>` element inside the shadow DOM wrapper.

## Pros
- Correct property types (`color` type will show color picker in inspector)
- Inherits focus/keyboard events from APLActionableComponent

## Cons
- Missing many APL EditText properties: `borderColor`, `borderWidth`, `fontSize`, `hint`, `hintColor`, `keyboardType`, `maxLength`, `selectOnFocus`, `submitKeyType`, `onSubmit`, `onTextChange`
- No position/alignment properties merged

## Issues
- None currently tracked
