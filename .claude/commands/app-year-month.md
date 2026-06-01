# AppYearMonthComponent

Describe the `AppYearMonthComponent` date picker based on the following analysis.

## Overview

`AppYearMonthComponent` (`custom/AppYearMonthComponent.js`) is a standalone year-month date picker built as a Web Component. It provides a two-step selection flow: pick a year from a paginated grid, then pick a month. The file contains three classes that form a component family:

1. **AppYearMonthComponent** - main component with input display
2. **AppYearMonthSelectComponent** - shared base for year/month selector popups
3. **AppYearMonthSelectYearComponent** - year grid selector
4. **AppYearMonthSelectMonthComponent** - month grid selector

## Tags
- `<ba-app-year-month-component>` - main component
- `<year-month-select-year-component>` - year popup
- `<year-month-select-month-component>` - month popup

## How It Works

1. User clicks the read-only input field
2. Year selector appears as a fixed-position popup showing 10 years in a 3-column grid
3. Navigation buttons (`<` / `>`) paginate through year ranges
4. Selecting a year opens the month selector for that year
5. Selecting a month closes the popup and fires `EVENT_CHANGED` with `{year, month}`
6. The input displays "Month Year" (e.g., "May 2024")

## Attributes
- `year` - initial year (number)
- `month` - initial month (3-letter abbreviation: Jan, Feb, etc.)

## Events
- Fires `BestAppsComponent.EVENT_CHANGED` with `{type: 'monthSelected', data: {year, month}}`
- Uses custom DOM events `year-selected` and `month-selected` for internal communication (bubbles, composed)

## Pros
- Self-contained year-month picker with no external dependencies
- Clean two-step UX flow (year -> month)
- Paginated year navigation with flexible ranges
- Uses Shadow DOM for style encapsulation
- Fires standard events for external consumption
- Selected state visual highlighting

## Cons
- Custom element tags for sub-components don't follow the `ba-` prefix convention (`year-month-select-year-component`)
- `year` attribute parsed with `* 1` instead of `parseInt()` or `Number()` - fragile coercion
- Fixed-position popup doesn't account for viewport boundaries (can overflow off-screen)
- `window.addEventListener('mouseup')` on every instance - no cleanup, potential leak with many instances
- Month names are hardcoded as 3-letter English abbreviations (no i18n)
- No keyboard navigation support

## Issues
- **Event listener leak**: `window.addEventListener('mouseup')` is added per instance and never removed on disconnect
- **Year range navigation**: `<` button sets `[yearStart - 8, yearStart + 1]` and `>` sets `[yearEnd - 1, yearEnd + 8]` - range sizes change from 10 to 9 items on navigation
