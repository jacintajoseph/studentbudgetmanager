# Student Budget Manager

A small static web app to track student expenses, visualize category breakdowns, and manage a monthly budget.

Features
- Add expenses with date, name, amount and category (Food, Travel, Shopping, Entertainment).
- Transactions table with delete functionality.
- Monthly budget input and remaining budget progress bar.
- Category summary and pie chart (Chart.js).
- Smart spending insights and simple recommendations.
- Generate and download a text PDF report (jsPDF).
- Light/Dark mode toggle and data persistence using localStorage.

Quick start
1. Open `index.html` in your browser (double-click) or serve the folder locally:

```bash
cd /path/to/ExpenseTracker
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

2. Add a monthly budget, add expenses, and navigate the Dashboard, Expenses and Analytics tabs.

Notes
- All data is stored in your browser's localStorage for persistence across reloads.
- The project is intentionally simple and client-only (no backend).

License
- MIT

Author: jacintajoseph
