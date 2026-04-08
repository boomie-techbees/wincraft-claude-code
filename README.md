# WinCraft

**Track your wins, own your story.**

WinCraft is a personal achievement tracker that helps you record your wins, generate AI-powered summaries, and turn your accomplishments into polished resume bullets.

🌐 **Live site:** https://techbees.me/wincraft-app

---

## Features

- **Win tracking** — Record wins with optional tags and dates
- **Grammar check** — AI-powered spelling and grammar suggestions before saving
- **AI Summary** — Get an encouraging overview of your recent accomplishments
- **Resume bullets** — Turn your wins into professional resume bullet points
- **Multi-user auth** — Each user has a private account with their own data
- **Google OAuth** — Sign in with Google or email/password

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (no framework), custom CSS |
| Auth | Netlify Identity (GoTrue) |
| Data storage | Netlify Blobs (per-user, server-side) |
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

# Start local dev server with HTTPS tunnel (required for Netlify Identity)
netlify dev --live
```

> **Note:** Use `netlify dev --live` instead of plain `netlify dev`. Netlify Identity requires HTTPS, which the `--live` flag provides via a tunnel.

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
│   ├── auth.js                   # Netlify Identity wrapper
│   ├── api.js                    # API client (wins CRUD + AI endpoints)
│   ├── store.js                  # Data layer (wins via API, settings via localStorage)
│   ├── app.js                    # SPA router, auth gate
│   ├── components/
│   │   ├── nav.js                # Navigation
│   │   ├── toast.js              # Toast notifications
│   │   └── winCard.js            # Win card component
│   └── pages/
│       ├── entry.js              # New win form
│       ├── output.js             # Wins list, AI summary, resume tabs
│       └── settings.js           # User settings + sign out
├── netlify/functions/
│   ├── wins.mjs                  # Wins CRUD API (Netlify Blobs)
│   ├── grammar.mjs               # Grammar check (Claude API)
│   ├── summary.mjs               # AI summary (Claude API)
│   └── resume.mjs                # Resume bullets (Claude API)
├── netlify.toml                  # Netlify build + redirect config
└── package.json                  # Dependencies (@netlify/blobs)
```

---

## Branch & Deploy Workflow

This project uses Netlify deploy previews for staging:

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes and commit
3. Push: `git push origin feat/my-feature`
4. Open a PR on GitHub — Netlify auto-generates a **deploy preview URL** in the PR checks
5. Test on the preview URL
6. Merge to `main` → auto-deploys to production

---

## Pending / Upcoming Features

- [ ] Custom Google OAuth credentials (so users see "WinCraft" on the consent screen, not "Netlify Identity")
- [ ] Win editing
- [ ] Filter/search wins by tag
- [ ] Date range filtering for AI summary and resume bullets
