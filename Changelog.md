# 📜 Project History & Changelog: Work Log & Invoice Manager

This document tracks the evolution of the Professional Work Log & Invoice Manager, from its initial concept to the current high-stability build.

---

## [1.0.0] - The MVP (Minimum Viable Product)
**"The Proof of Concept"**
* **Basic Logging:** Created the initial HTML structure to input a date, task, and duration.
* **Live Table:** Implemented a simple table that displayed tasks as they were added.
* **Basic Math:** Added a function to multiply hours by a hardcoded rate to show a subtotal.

---

## [1.1.0] - Persistent Storage
**"The Memory Update"**
* **LocalStorage Integration:** Added logic to save tasks to the browser's memory so data wouldn't disappear on page refresh.
* **Clear Function:** Added a "Clear" button to wipe the month's data for a fresh start.

---

## [1.2.0] - Professional Print & Layout
**"The Invoice Transition"**
* **Print Media Queries:** Added CSS `@media print` rules to hide input forms and buttons during export.
* **Grouped by Date:** Updated logic to group multiple tasks under a single date header.
* **Legal Size Support:** Adjusted container width and margins to support **8.5" x 14" (Legal)** paper layouts.

---

## [1.3.0] - Dynamic Meta Data
**"The Client Update"**
* **User/Client Fields:** Added inputs for "Invoice Number," "Client Name," and "Hourly Rate" directly in the UI.
* **Real-time Updates:** Linked fields to the render function for instant header updates.

---

## [1.4.0] - Branding & Safety Nets
**"The Professional Build"**
* **Self-Branding:** Added "Your Name / Company" and "Contact Info" fields that save permanently.
* **Edit Function:** Introduced the ability to modify existing entries via a pencil icon.
* **Global Undo:** Added a 15-second window to restore data after "Clear All."

---

## [1.5.0] - The AI "Polish" Experiment (REMOVED)
**"The Corporate Pivot"**
* **The Feature:** Attempted to add a **✨ Professional Polish** button to swap casual words for corporate ones.
* **The Conflict:** Automated text manipulation caused "double bullet points" and script crashes.
* **The Decision:** **Rolled Back** this feature to preserve 100% reliability and manual control.

---

## [1.6.0] - UX & Print Refinement (Current Version)
**"The Quality of Life Update"**
* **Individual Undo Delete:** Implemented a "Trash Bin" logic. Deleting a single entry now triggers a 10-second "Undo Delete" button.
* **Restored Edit Controls:** Fixed a bug where the "Cancel Edit" button failed to appear during task modification.
* **Clean PDF Export:** Optimized layout instructions to guide users in removing browser-generated headers/footers (GitHub URL and page titles) from PDF exports.
* **Code Hardening:** Consolidated logic into a single robust engine using the stable `v1.4` storage key.

---

**Status:** *Maintenance Mode. Optimized for reliability, professional manual entry, and clean legal-size PDF exports.*
