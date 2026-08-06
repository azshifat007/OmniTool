# Components

## Navbar (`components/Navbar.js`)

Fixed-position navigation bar with three sections:

1. **Logo** — OmniTool wordmark with gradient "O" icon, links to `/`
2. **Search** — Live tool search with dropdown results (max 20), filters by title/description/category, closes on Escape or outside click
3. **Actions** — Theme toggle (sun/moon icons) + History link (clock icon)

On scroll > 20px, applies backdrop blur and shadow.

## TiltCard (`components/TiltCard.js`)

Home page tool card wrapper:
- Wraps content in a `<Link>` to the tool's route
- Gradient accent bar at top (primary → accent)
- Hover effect: lifts 4px, adds shadow, brightens accent bar
- Used in the 3-column grid on `app/page.js`

## GlassCard (`components/GlassCard.js`)

Simple container component for tool pages:
- `bg-surface` background with `rounded-2xl` and `border-border`
- Accepts optional `className` prop for customization
- Wraps children in a card shell

## CopyButton (`components/CopyButton.js`)

Clipboard copy button with animated state feedback:
- Copies `text` prop to clipboard via `navigator.clipboard.writeText()`
- Falls back to `<textarea>` + `document.execCommand('copy')`
- Shows "Copy" → "Copied" with checkmark animation via Framer Motion AnimatePresence
- Auto-resets after 1.5s

## ThemeProvider (`components/ThemeProvider.js`)

Dark/light theme context:
- Reads `localStorage('omnitool-dark')` or `prefers-color-scheme` media query
- Toggles `.dark` class on `document.documentElement`
- Persists to localStorage on change
- Client-side only with SSR-safe mounting check
- Exports `useTheme()` hook returning `{ dark, toggle }`

## HistoryProvider (`components/HistoryProvider.js`)

Usage history tracking context:
- Wraps `lib/history.js` localStorage functions
- Stores entries as `{ id, name, timestamp }` with max 20 items
- Exports `useHistory()` hook returning `{ history, addEntry, clear }`
- Auto-loads from localStorage on mount

## Tool Page Template

Each of the 144 tools follows this pattern:
- `'use client'` directive
- React hooks: `useState`, `useCallback`, optional `useRef`, `useEffect`, `useMemo`
- Framer Motion: `motion.div` for entry animation
- Components: `GlassCard`, `CopyButton`, `useHistory`
- Error display: `{error && <div className="...">...</div>}`
- History tracking: `addEntry('Tool Name')` on user action
- All processing uses browser APIs (Web Crypto, Web Audio, Canvas, FileReader, etc.)
