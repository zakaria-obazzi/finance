# 💹 Financial Assistant

A browser-based personal finance tracker with NLP-powered input, charts, budgets, and smart insights — no server required.

## 📁 Project Structure

```
financial-assistant/
├── index.html        ← Main entry point
├── css/
│   └── style.css     ← All styles & CSS variables
├── js/
│   └── app.js        ← NLP engine, charts, logic
└── README.md         ← You are here
```

## 🚀 Deployment

This is a **100% static** project — no build tools, no backend, no database.

### Option 1 — GitHub Pages (free)
1. Push this folder to a GitHub repo
2. Go to **Settings → Pages → Source: main branch / root**
3. Your app is live at `https://<your-username>.github.io/<repo-name>/`

### Option 2 — Netlify (free, drag & drop)
1. Go to [netlify.com](https://netlify.com) and create an account
2. Drag the entire `financial-assistant/` folder into the Netlify dashboard
3. Done — you get a live URL instantly

### Option 3 — Vercel (free)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` inside the project folder
3. Follow the prompts — your site goes live in seconds

### Option 4 — Run locally
Open `index.html` directly in any modern browser. No server needed.

## ✨ Features

- **NLP Input** — type transactions in plain English
- **15 expense categories** — auto-detected
- **4 interactive charts** — doughnut, bar, trend, monthly
- **50/30/20 rule analysis**
- **Budget limits** with real-time alerts
- **Recurring / subscription tracker**
- **Financial runway calculator**
- **Smart tips** based on your data
- **Transaction history** — search, filter, delete
- **CSV export**
- **Dark / Light mode**
- **Fully responsive** — works on mobile

## 🛠️ Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Markup    | HTML5 (semantic, accessible)  |
| Styles    | CSS3 with custom properties   |
| Logic     | Vanilla JavaScript (ES6+)     |
| Charts    | Chart.js 3.9.1 (CDN)          |
| Storage   | In-memory (session only)      |

## 📝 Customisation

- To change the colour scheme, edit the CSS variables at the top of `css/style.css`
- To add new expense categories, extend the `CATS` object in `js/app.js`
- To persist data across sessions, add `localStorage` serialization around the `txs` array in `js/app.js`

---

Developed by **Your Name** · Financial Assistant v1.0
