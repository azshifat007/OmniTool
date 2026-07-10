# Development Guide

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npm run dev        # development server at http://localhost:3000
npm run build      # production build
npm start          # start production server
```

## Project Conventions

### Tool Pages

Each tool lives in `app/tools/<name>/page.js` and follows a strict pattern:

1. `'use client'` — all tools are client components
2. Import pattern:
   - `useState`, `useCallback`, `useRef`, `useEffect`, `useMemo` from React
   - `motion` from `framer-motion`
   - `GlassCard` from `@/components/GlassCard`
   - `CopyButton` from `@/components/CopyButton` (if output is copyable)
   - `useHistory` from `@/components/HistoryProvider`
3. Call `addEntry('Tool Name')` when user performs a meaningful action
4. Wrap content in `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>`
5. Header section with icon + title
6. Error pattern: `{error && <div className="mt-4 text-cat-text text-sm">...</div>}`

### Tool Registration

Tools are registered in `lib/tools.js` as an array of:

```js
{ href: '/tools/<name>', title: 'Display Name', desc: 'Short description', icon: '◉', cat: 'Category' }
```

Categories are: `Text`, `PDF`, `Code`, `Security`, `Design`, `Date`, `Media`, `Math`, `Network`, `DevOps`, `Fun`, `System`.

### Icons

- Use Unicode text symbols, NOT emoji
- Category-specific color classes are auto-applied via `iconColors` map
- Common icons: `◉`, `◐`, `◑`, `⇔`, `⇄`, `⚡`, `♪`, `♩`, etc.

### Components

All reusable components are in `components/`:
- Use `GlassCard` as the primary container on tool pages
- Use `CopyButton` for copy-to-clipboard functionality
- Use `useHistory().addEntry()` for tracking tool usage

## Styling

Tailwind CSS v4 with CSS-first configuration:
- All theme tokens in `app/globals.css` under `@theme inline { ... }`
- Dark mode via `.dark` class overrides
- No `tailwind.config.js` file
- Custom animations defined as `@keyframes` in globals.css
- Category-specific colors: `text-cat-{code,design,media,...}`

## Building

```bash
npm run build
```

Build output verified: 152 static pages (144 tools + 8 special routes).

## Deployment

Zero-config Vercel deployment:
- `vercel.json` sets `framework: "nextjs"`
- No environment variables needed
- Fully static — all processing is client-side
