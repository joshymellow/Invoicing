# Monthly Invoice & Work Log System

A lightweight, browser-based invoicing tool designed for tracking daily tasks over a monthly period. This system allows for detailed logging with bulleted descriptions, daily hour/subtotal summaries, and exports to a professional **Legal-sized (8.5" x 14")** PDF.

## 🚀 Features

-   **Persistence:** Automatically saves all data to your browser's `localStorage`. Your logs stay even if you close the tab.
-   **Daily Grouping:** Tasks are automatically grouped by date with a dedicated header.
-   **Financial Tracking:** Displays total hours worked per day and the calculated subtotal based on your rate ($5.17/hr).
-   **Rich Descriptions:** Supports multi-line comments that render as bulleted lists on the final invoice.
-   **Edit/Delete:** Full control to correct errors in previously logged entries.
-   **Legal Size Print:** CSS optimized specifically for **8.5 x 14** document export.
-   **Privacy Focused:** No database or server is used; all data stays on your local machine.

## 📁 File Structure

-   `index.html`: The core structure and layout of the app.
-   `style.css`: Professional styling and print-specific media queries for Legal paper.
-   `script.js`: The "brain" of the app, handling math, storage, and grouping logic.

## 🛠️ How to Use

1.  **Setup:** Upload these three files to a GitHub repository and enable **GitHub Pages** in the repository settings.
2.  **Configuration:** Enter your Invoice Number and Client Name in the header.
3.  **Logging:** - Select the date.
    - Enter the Main Task and any detailed notes (use 'Enter' for bullets).
    - Enter the duration in hours.
    - Click **Add to Invoice**.
4.  **Editing:** Click the ✎ icon to reload a task into the form for editing. Click **Save Changes** to update.
5.  **Export:** Click **Print / Save PDF**. Ensure your print settings are set to **Legal (8.5 x 14)** for the best result.

## 📧 Contact
**Developer:** [codornizjoshuaisaiah@gmail.com](mailto:codornizjoshuaisaiah@gmail.com)
