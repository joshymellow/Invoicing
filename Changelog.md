# Changelog

All notable changes to the Work Log & Invoice Manager will be documented in this file.

## [1.2.0] - Post-Release "Safety Net" Update - 2026-04-30
### Added
- **Undo Clear:** Added a 20-second recovery window after clearing the monthly log.
- **Cancel Edit:** Added a button to exit Edit Mode without saving changes.
- **Visual Feedback:** The "Add" button now changes color (Orange) when in Edit Mode.
### Changed
- Updated `localStorage` key to `monthlyInvoiceData_Final` for a fresh data structure.

## [1.1.0] - Layout & Detail Update
### Added
- **Legal Size Support:** Added CSS `@page` rules for 8.5" x 14" PDF export.
- **Bulleted Descriptions:** Changed additional comments to a `textarea` that renders as a `<ul>` list.
- **Daily Financial Tracker:** Added total hours and subtotals to each daily header.
- **Edit Feature:** Added the ability to reload previous entries into the form for correction.
### Removed
- Removed "Professional Monthly Invoice" text to streamline the professional look.

## [1.0.0] - Initial Release
### Added
- Core invoicing engine with $5.17/hr default rate.
- Persistent local storage.
- Basic PDF print styling.
- Task logging with date, title, and duration.
