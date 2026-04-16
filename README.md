# WinCraft

**Track your wins, own your story.**

WinCraft is a personal achievement tracker that helps you record your wins, generate AI-powered summaries, and turn your accomplishments into polished resume bullets.

🌐 **Live site:** https://gleeful-puffpuff-8beac5.netlify.app

> **Note:** This is the February 2026 snapshot of the Claude Code version, preserved for comparison with versions built in Bolt, Lovable, and Replit. Wins are stored in your browser's localStorage — no account required.

---

## Features

- **Win tracking** — Record wins with optional tags and dates
- **Grammar check** — AI-powered spelling and grammar suggestions before saving
- **AI Summary** — Get an encouraging overview of your recent accomplishments
- **Resume bullets** — Turn your wins into professional resume bullet points

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (no framework), custom CSS |
| Data storage | localStorage (browser) |
| AI features | Anthropic Claude API via Netlify Functions |
| Hosting | Netlify |

---

## Local Development

Requires [Netlify CLI](https://docs.netlify.com/cli/get-started/).

```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Link to the Netlify site (one-time setup)
netlify login
netlify link

# Start local dev server
netlify dev
```

---

## Environment Variables

Set these in your Netlify site dashboard under **Site configuration → Environment variables**:

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for AI features |

---

## Project Structure

```
wincraft-claude/
├── index.html                    # App entry point
├── css/
│   └── style.css                 # All styles
├── js/
│   ├── api.js                    # API client (AI endpoints)
│   ├── store.js                  # Data layer (localStorage)
│   ├── app.js                    # SPA router
│   ├── components/
│   │   ├── nav.js                # Navigation
│   │   ├── toast.js              # Toast notifications
│   │   └── winCard.js            # Win card component
│   └── pages/
│       ├── entry.js              # New win form
│       ├── output.js             # Wins list, AI summary, resume tabs
│       └── settings.js           # User settings
├── netlify/functions/
│   ├── wins.mjs                  # Wins CRUD API
│   ├── grammar.mjs               # Grammar check (Claude API)
│   ├── summary.mjs               # AI summary (Claude API)
│   └── resume.mjs                # Resume bullets (Claude API)
└── netlify.toml                  # Netlify build + redirect config
```
