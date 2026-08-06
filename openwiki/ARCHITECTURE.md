# Architecture

## Project Structure

```
OmniTool/
├── app/                    # Next.js App Router pages
│   ├── layout.js           # Root layout
│   ├── page.js             # Home page (tool grid)
│   ├── globals.css         # Tailwind v4 + custom styles
│   ├── favicon.ico
│   ├── tools/              # 144 individual tool pages
│   │   └── <name>/page.js  # Each tool is a directory with page.js
│   ├── converter/
│   │   └── universal/      # Universal format converter
│   ├── pdf/
│   │   └── merge/          # PDF merger
│   ├── regex/              # Regex tester (special route)
│   └── history/            # Usage history page
├── components/             # Reusable UI components
│   ├── Navbar.js           # Navigation bar with search
│   ├── TiltCard.js         # Home page tool card
│   ├── GlassCard.js        # Tool page container
│   ├── CopyButton.js       # Clipboard copy
│   ├── ThemeProvider.js     # Dark/light theme
│   └── HistoryProvider.js   # Usage history context
├── lib/                    # Shared utilities
│   ├── tools.js            # Tool registry (144 entries)
│   ├── converters.js       # JSON/YAML/Base64/URL converters
│   └── history.js          # localStorage-backed history
├── public/                 # Static assets
├── node_modules/
├── package.json
├── next.config.mjs         # Empty default config
├── postcss.config.mjs      # Tailwind v4 PostCSS
├── jsconfig.json           # @/ path alias
├── vercel.json             # Vercel framework preset
└── .gitignore
```

## Data Flow

All state is client-side only:

1. **Theme**: `ThemeProvider` reads `localStorage('omnitool-dark')` → applies `.dark` class on `<html>`
2. **History**: `HistoryProvider` wraps `lib/history.js` which reads/writes `localStorage('omnitool_history')`
3. **Tools**: Static array in `lib/tools.js`, imported by both `app/page.js` (grid) and `components/Navbar.js` (search)
4. **Tool state**: Each tool manages its own React state (useState, useRef) — no global store

## Routing

- `/` — Home page with tool grid
- `/tools/<name>` — Individual tool page
- `/regex` — Regex tester (standalone route)
- `/pdf/merge` — PDF merger
- `/converter/universal` — Universal format converter
- `/history` — Usage history

All routes are statically generated at build time (Next.js Static Generation).

## Styling

Tailwind CSS v4 with CSS-based configuration:

- `globals.css` uses `@theme inline { ... }` for all design tokens
- No `tailwind.config.js` — Tailwind v4 uses CSS-first config
- Two themes: light (default) and `.dark` class overrides
- Custom animations: `fade-up`, `shimmer`, `float`, `pulse-dot`
- Glassmorphism via `bg-surface` + `border-border` + `nav-blur` backdrop-filter

## Tool Page Pattern

Every tool page follows this pattern:

```jsx
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function ToolNamePage() {
  const { addEntry } = useHistory();

  // state management

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">◉</span>
        <h1 className="font-heading text-2xl font-bold text-text">Tool Name</h1>
      </div>
      {/* GlassCard content */}
    </motion.div>
  );
}
```
