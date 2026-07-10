# OmniTool

> A playful toolkit for developers, creators, and tinkerers — all in one place. All processing happens locally in your browser.

**Stack:** Next.js 16.2.10 · React 19.2.4 · Tailwind CSS v4 · Framer Motion  
**Deploy:** Fully static, zero-config Vercel deployment  
**Auth:** None required — completely client-side

## Quick Start

```bash
npm install
npm run dev    # → http://localhost:3000
npm run build  # static export to .next/
```

## Key Facts

- **144 tools** across 13 categories
- **Zero backend** — all processing is browser-local (Web APIs, Web Crypto, Web Audio, Canvas)
- **Dark/light theme** with system preference detection and localStorage persistence
- **Usage history** tracked in localStorage, viewable at `/history`
- **No npm packages beyond Next.js stack** — no external API calls, no database, no build-time data

## Categories

| Category | Count | Description |
|----------|-------|-------------|
| Text | 13 | Regex, case conversion, diff, analysis, lorem ipsum, sorting, slugify |
| Code | 23+ | JSON, YAML, Base64, URL, JWT, HTML, CSS, SQL, GraphQL formatters |
| Design | 20+ | Color tools, gradients, shadows, typography, CSS generators |
| Media | 14 | QR codes, image processing, audio, TTS, STT, video tools |
| PDF | 9 | Merge, split, rotate, protect, convert |
| Math | 9 | Calculator, unit converter, percentage, prime checker |
| Security | 6 | Hash, password, encryption, OTP, RSA, JWT |
| Date | 8 | Timestamp, timezone, date diff, calendar, moon phase |
| Network | 5 | IP lookup, subnet calculator, port reference, HTTP request builder |
| DevOps | 3 | Cron parser, HTTP status codes, git reference |
| Fun | 9 | Dice, emoji search, countdown, pomodoro, decision maker |
| System | 4 | Device info, battery, keyboard tester, storage explorer |

## Architecture

```
app/                    # Next.js App Router
├── layout.js           # Root layout: fonts, ThemeProvider, HistoryProvider, Navbar
├── page.js             # Home page — tool grid with TiltCard components
├── globals.css         # Tailwind v4 @theme config + custom animations
├── tools/              # 144 tool pages, each a self-contained page.js
├── converter/universal # Universal format converter
├── pdf/merge           # PDF merger tool
├── regex/              # Regex tester
└── history/            # Usage history page
components/             # Reusable UI components (6 files)
lib/                    # Shared utilities (3 files)
public/                 # Static assets (SVG icons)
```

## Component Library

| Component | Role |
|-----------|------|
| `Navbar` | Fixed top nav with search, theme toggle, history link |
| `TiltCard` | Hover-lift card wrapper for home page tool grid |
| `GlassCard` | Glassmorphism container for tool pages |
| `CopyButton` | Animated clipboard copy button |
| `ThemeProvider` | Dark/light theme context with localStorage |
| `HistoryProvider` | Usage tracking context with localStorage |

## Adding a New Tool

1. Create `app/tools/<name>/page.js` following the standard pattern
2. Add entry to `lib/tools.js` with `{ href, title, desc, icon, cat }`
3. Build validates all pages automatically

Each tool page must:
- Start with `'use client'`
- Import `GlassCard`, `CopyButton`, `useHistory` from `@/components/`
- Use `useHistory().addEntry('Tool Name')` to log usage
- Wrap content in `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>`
- Use `error && <div>` pattern for error display
