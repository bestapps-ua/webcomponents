# APL Commands

Describe the APLCommand hierarchy based on the following analysis.

## Overview

The command system (`custom/APL/ObjectInspector/command/`) models APL commands that are attached to component events (e.g., `onPress: [{type: "SendEvent", arguments: [...]}]`). Commands are plain classes (not Web Components) with private fields, getters/setters, and APL data serialization.

## Class Hierarchy

```
APLCommand (base)
  APLSendEventCommand
  APLSetValueCommand
```

### APLCommand (`APLCommand.js`)
Base command with common APL command properties:

| Property | Type | Description |
|---|---|---|
| `uid` | auto | Crypto-random 12-char ID |
| `type` | text | Command type name |
| `description` | text | Human-readable description |
| `delay` | text | Delay before execution (ms) |
| `screenLock` | text | Lock screen during execution |
| `sequencer` | text | Named sequencer for ordering |
| `when` | text | Conditional expression |

Key methods:
- `getAll()` - returns property definitions with types
- `getAPLData()` - serializes all properties to a plain object
- `getOther()` - returns properties not in the input data (for inspector defaults)

### APLSendEventCommand (`APLSendEventCommand.js`)
Sends events to the Alexa skill backend.

Additional properties:
| Property | Type | Description |
|---|---|---|
| `arguments` | array | Event arguments sent to skill |
| `components` | array | Component IDs to include |
| `flags` | text | Event flags |

### APLSetValueCommand (`APLSetValueCommand.js`)
Sets a property value on a component.

Additional properties:
| Property | Type | Description |
|---|---|---|
| `componentId` | text | Target component ID |
| `property` | text | Property name to set |
| `value` | text | New value |

## Pros
- Clean use of private fields (`#uid`, `#type`, etc.) with getters/setters
- `getAll()` and `getAPLData()` provide consistent serialization
- `getOther()` handles properties not in the original data for the inspector
- UID generation uses crypto-random bytes
- Extensible pattern - adding new command types is straightforward

## Cons
- Only 2 of 15+ APL command types implemented (missing: AnimateItem, AutoPage, ClearFocus, Finish, Idle, OpenURL, Parallel, ScrollToIndex, Select, Sequential, SetFocus, SetPage, SpeakItem, SpeakList)
- `generateUid()` is duplicated from `BestAppsComponent.generateUid()` - same exact implementation
- `getOther()` logic is inverted - returns properties NOT in props, but checks `if(this.props[prop]) continue` which skips truthy values but includes falsy ones (0, "", null)
- All additional properties typed as `text` even when they should be arrays or objects
- Private fields declared but setter/getter patterns are verbose - could use simpler patterns

## Issues
- None currently tracked
