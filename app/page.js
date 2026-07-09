'use client';

import TiltCard from '@/components/TiltCard';
import { motion } from 'framer-motion';

const tools = [
  { href: '/regex', title: 'Regex Tester', desc: 'Test & visualize regular expressions with live match highlighting', icon: '◉', cat: 'Text' },
  { href: '/tools/case', title: 'Case Converter', desc: 'Transform text between uppercase, lowercase, camelCase, snake_case & more', icon: 'Aa', cat: 'Text' },
  { href: '/tools/diff', title: 'Diff Checker', desc: 'Compare two texts side by side and highlight differences', icon: '⇔', cat: 'Text' },
  { href: '/tools/stats', title: 'Text Statistics', desc: 'Analyze word count, characters, sentences, reading time & more', icon: 'Σ', cat: 'Text' },
  { href: '/tools/lorem', title: 'Lorem Ipsum Generator', desc: 'Generate placeholder text for mockups and designs', icon: '¶', cat: 'Text' },
  { href: '/tools/sorter', title: 'Text Sorter', desc: 'Sort lines alphabetically, by length, or randomize', icon: '⇕', cat: 'Text' },
  { href: '/tools/slugify', title: 'Slugify', desc: 'Convert text to URL-friendly slugs and identifiers', icon: '§', cat: 'Text' },
  { href: '/tools/replace', title: 'Find & Replace', desc: 'Search and replace text with optional regex support', icon: '✎', cat: 'Text' },
  { href: '/tools/reverser', title: 'Text Reverser', desc: 'Reverse, flip and transform text in multiple ways', icon: '↔', cat: 'Text' },
  { href: '/tools/regex-explain', title: 'Regex Explainer', desc: 'Understand regex patterns with plain-English breakdowns', icon: '◉', cat: 'Text' },
  { href: '/tools/wordcount', title: 'Word Counter', desc: 'Detailed text statistics with word frequency analysis', icon: 'Wc', cat: 'Text' },
  { href: '/tools/morse', title: 'Morse Code Converter', desc: 'Convert text to and from Morse code', icon: '···', cat: 'Text' },
  { href: '/tools/palindrome', title: 'Palindrome Checker', desc: 'Check if text is a palindrome with advanced analysis', icon: '⇔', cat: 'Text' },
  { href: '/pdf/merge', title: 'PDF Merger', desc: 'Merge multiple PDFs with drag-and-drop reordering', icon: '⊞', cat: 'PDF' },
  { href: '/tools/pdf-split', title: 'Split PDF', desc: 'Extract pages into separate PDF files', icon: '⇗', cat: 'PDF' },
  { href: '/tools/pdf-remove', title: 'Remove Pages', desc: 'Delete unwanted pages from a PDF document', icon: '✕', cat: 'PDF' },
  { href: '/tools/pdf-rotate', title: 'Rotate PDF', desc: 'Rotate individual pages in a PDF', icon: '⟳', cat: 'PDF' },
  { href: '/tools/pdf-protect', title: 'PDF Protect & Unlock', desc: 'Add or remove password protection from PDFs', icon: '⚷', cat: 'PDF' },
  { href: '/tools/jpg-to-pdf', title: 'JPG to PDF', desc: 'Convert images into a PDF document', icon: '▤', cat: 'PDF' },
  { href: '/tools/pdf-to-md', title: 'PDF to Markdown', desc: 'Extract text from PDF files as clean Markdown', icon: '⇩', cat: 'PDF' },
  { href: '/tools/md-to-pdf', title: 'Markdown to PDF', desc: 'Write Markdown and export as a styled PDF', icon: '⇧', cat: 'PDF' },
  { href: '/converter/universal', title: 'Universal Converter', desc: 'Convert JSON, YAML, Base64, and URL formats', icon: '⇄', cat: 'Code' },
  { href: '/tools/json', title: 'JSON Tools', desc: 'Format, validate, and minify JSON data', icon: '{}', cat: 'Code' },
  { href: '/tools/base', title: 'Base Converter', desc: 'Convert between binary, octal, decimal, and hexadecimal', icon: '0x', cat: 'Code' },
  { href: '/tools/uuid', title: 'UUID Generator', desc: 'Generate UUID v4 & v7 in bulk', icon: '⦿', cat: 'Code' },
  { href: '/tools/urlencode', title: 'URL Encoder/Decoder', desc: 'Encode and decode URLs and query strings', icon: '⇄', cat: 'Code' },
  { href: '/tools/jwt', title: 'JWT Debugger', desc: 'Decode and inspect JWT tokens client-side', icon: '◈', cat: 'Code' },
  { href: '/tools/html-preview', title: 'HTML Preview', desc: 'Render and preview HTML/CSS/JS in a live sandbox', icon: '◩', cat: 'Code' },
  { href: '/tools/json-csv', title: 'JSON ↔ CSV', desc: 'Convert between JSON and CSV formats', icon: '⇅', cat: 'Code' },
  { href: '/tools/html-entities', title: 'HTML Entities', desc: 'Encode and decode HTML special characters', icon: '&amp;', cat: 'Code' },
  { href: '/tools/markdown-preview', title: 'Markdown Preview', desc: 'Live preview of rendered markdown with split view', icon: 'M↓', cat: 'Code' },
  { href: '/tools/base64', title: 'Base64 Encoder/Decoder', desc: 'Encode and decode Base64 text and files', icon: 'B64', cat: 'Code' },
  { href: '/tools/css-minify', title: 'CSS Minifier', desc: 'Minify CSS and compare size savings', icon: 'CSS', cat: 'Code' },
  { href: '/tools/sql-formatter', title: 'SQL Formatter', desc: 'Format SQL queries with proper indentation', icon: 'SQL', cat: 'Code' },
  { href: '/tools/yaml', title: 'YAML Formatter', desc: 'Format, validate, and convert between YAML and JSON', icon: 'YML', cat: 'Code' },
  { href: '/tools/xml-formatter', title: 'XML Formatter', desc: 'Format and minify XML documents', icon: 'XML', cat: 'Code' },
  { href: '/tools/html-formatter', title: 'HTML Formatter', desc: 'Format and beautify HTML markup', icon: 'HTML', cat: 'Code' },
  { href: '/tools/hash', title: 'Hash Generator', desc: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes', icon: '#', cat: 'Security' },
  { href: '/tools/password', title: 'Password Generator', desc: 'Generate strong passwords with strength meter', icon: '⚷', cat: 'Security' },
  { href: '/tools/encrypt', title: 'Encryption Tools', desc: 'Encrypt and decrypt text with AES via Web Crypto API', icon: '⚔', cat: 'Security' },
  { href: '/tools/bcrypt', title: 'SHA Hash Verifier', desc: 'Generate and verify SHA-256 hashes with salt', icon: '✓', cat: 'Security' },
  { href: '/tools/otp', title: 'OTP Generator', desc: 'Generate TOTP codes for two-factor authentication', icon: '⊕', cat: 'Security' },
  { href: '/tools/color', title: 'Color Converter', desc: 'Convert between Hex, RGB, HSL with live preview', icon: '◐', cat: 'Design' },
  { href: '/tools/gradient', title: 'Gradient Generator', desc: 'Create beautiful CSS gradients with live preview', icon: '◑', cat: 'Design' },
  { href: '/tools/shadows', title: 'Box Shadow Generator', desc: 'Design and preview CSS box shadows interactively', icon: '▨', cat: 'Design' },
  { href: '/tools/radius', title: 'Border Radius Generator', desc: 'Visual border-radius editor with presets', icon: '◧', cat: 'Design' },
  { href: '/tools/palette', title: 'Color Palette', desc: 'Generate harmonious color palettes from a seed color', icon: '◐', cat: 'Design' },
  { href: '/tools/typography', title: 'Typography Scale', desc: 'Generate modular typography scales for your projects', icon: 'T', cat: 'Design' },
  { href: '/tools/filter', title: 'CSS Filter Generator', desc: 'Create and preview CSS filter effects visually', icon: '◑', cat: 'Design' },
  { href: '/tools/font-preview', title: 'Font Preview', desc: 'Preview and compare system fonts with custom text', icon: 'F', cat: 'Design' },
  { href: '/tools/spinner', title: 'Loading Spinner', desc: 'Generate CSS loading spinners and animations', icon: '⟳', cat: 'Design' },
  { href: '/tools/svg-viewer', title: 'SVG Viewer', desc: 'Paste, preview, and inspect SVG code', icon: '◇', cat: 'Design' },
  { href: '/tools/css-anim', title: 'CSS Animation Generator', desc: 'Create and preview CSS keyframe animations', icon: '▶', cat: 'Design' },
  { href: '/tools/unit', title: 'Unit Converter', desc: 'Convert between length, weight, temperature, data, and speed units', icon: '⇅', cat: 'Math' },
  { href: '/tools/calculator', title: 'Calculator', desc: 'A full-featured calculator with history', icon: '⊕', cat: 'Math' },
  { href: '/tools/percent', title: 'Percentage Calculator', desc: 'Calculate percentages, ratios, and changes', icon: '%', cat: 'Math' },
  { href: '/tools/random', title: 'Random Number Generator', desc: 'Generate random numbers with custom ranges', icon: '⊕', cat: 'Math' },
  { href: '/tools/tip', title: 'Tip Calculator', desc: 'Calculate tips and split bills between people', icon: '%', cat: 'Math' },
  { href: '/tools/primes', title: 'Prime Checker', desc: 'Check if a number is prime with factorization', icon: 'P', cat: 'Math' },
  { href: '/tools/numwords', title: 'Number to Words', desc: 'Convert numbers to English words and Roman numerals', icon: 'N', cat: 'Math' },
  { href: '/tools/geometry', title: 'Geometry Calculator', desc: 'Calculate area, perimeter, and volume of shapes', icon: '◇', cat: 'Math' },
  { href: '/tools/fibonacci', title: 'Fibonacci Generator', desc: 'Generate Fibonacci sequences with golden ratio', icon: 'φ', cat: 'Math' },
  { href: '/tools/timestamp', title: 'Timestamp Converter', desc: 'Convert Unix timestamps to readable dates', icon: '⏱', cat: 'Date' },
  { href: '/tools/timezone', title: 'Timezone Converter', desc: 'Convert times between different timezones', icon: '⏰', cat: 'Date' },
  { href: '/tools/datediff', title: 'Date Difference', desc: 'Calculate the difference between two dates', icon: '⇆', cat: 'Date' },
  { href: '/tools/mac', title: 'MAC Generator', desc: 'Generate random MAC addresses with custom prefixes', icon: '↗', cat: 'Network' },
  { href: '/tools/ip', title: 'IP Info Lookup', desc: 'Parse and inspect IPv4 and IPv6 address details', icon: '◎', cat: 'Network' },
  { href: '/tools/subnet', title: 'Subnet Calculator', desc: 'Calculate subnet masks, ranges, and host counts', icon: '⊞', cat: 'Network' },
  { href: '/tools/ports', title: 'Port Reference', desc: 'Searchable reference of common TCP/UDP ports', icon: '⇋', cat: 'Network' },
  { href: '/tools/latency', title: 'Latency Calculator', desc: 'Calculate network latency and RTT over distance', icon: '∼', cat: 'Network' },
  { href: '/tools/cron', title: 'Cron Parser', desc: 'Parse cron expressions and preview execution times', icon: '⏱', cat: 'DevOps' },
  { href: '/tools/http-status', title: 'HTTP Status Codes', desc: 'Searchable reference of all HTTP status codes', icon: '200', cat: 'DevOps' },
  { href: '/tools/git-ref', title: 'Git Reference', desc: 'Searchable reference of common Git commands', icon: 'G', cat: 'DevOps' },
  { href: '/tools/qr', title: 'QR Code Generator', desc: 'Generate QR codes from text or URLs', icon: '▦', cat: 'Media' },
  { href: '/tools/imageb64', title: 'Image to Base64', desc: 'Convert images to Base64-encoded data URIs', icon: '▣', cat: 'Media' },
  { href: '/tools/aspect', title: 'Aspect Ratio Calculator', desc: 'Calculate ratios and dimensions for any screen size', icon: '▬', cat: 'Media' },
  { href: '/tools/placeholder', title: 'Image Placeholder', desc: 'Generate placeholder images as inline SVGs', icon: '▯', cat: 'Media' },
  { href: '/tools/color-picker', title: 'Image Color Picker', desc: 'Pick colors from uploaded images with magnifier', icon: '◎', cat: 'Media' },
  { href: '/tools/age', title: 'Age Calculator', desc: 'Calculate exact age with zodiac and fun stats', icon: '◎', cat: 'Date' },
  { href: '/tools/workdays', title: 'Business Days', desc: 'Calculate workdays between dates excluding holidays', icon: '⇆', cat: 'Date' },
  { href: '/tools/worldclock', title: 'World Clock', desc: 'Live clocks for multiple timezones around the world', icon: '◉', cat: 'Date' },
  { href: '/tools/weeknum', title: 'Week Number', desc: 'Calculate ISO week number and day-of-year stats', icon: 'Wk', cat: 'Date' },
  { href: '/tools/decide', title: 'Decision Maker', desc: 'Coin flip, dice roll, yes/no, and custom picker', icon: '?', cat: 'Fun' },
  { href: '/tools/dice', title: 'Dice Roller', desc: 'Roll multiple dice with realistic animations', icon: '⚄', cat: 'Fun' },
  { href: '/tools/emoji-search', title: 'Emoji Search', desc: 'Search and copy emojis by name or keyword', icon: '☺', cat: 'Fun' },
  { href: '/tools/fake-data', title: 'Fake Data Generator', desc: 'Generate mock names, emails, phones & more', icon: 'D', cat: 'Code' },
  { href: '/tools/tts', title: 'Text to Speech', desc: 'Read text aloud with voice, rate & pitch controls', icon: '♫', cat: 'Media' },
  { href: '/tools/drawing-board', title: 'Drawing Board', desc: 'Freehand drawing canvas with color & brush control', icon: '✏', cat: 'Design' },
  { href: '/tools/image-resizer', title: 'Image Resizer', desc: 'Resize images by dimensions with aspect ratio lock', icon: '⧉', cat: 'Media' },
  { href: '/tools/countdown', title: 'Countdown Timer', desc: 'Set a timer with presets, pause, and audible alert', icon: '⏳', cat: 'Fun' },
  { href: '/tools/color-blindness', title: 'Color Blindness Simulator', desc: 'Simulate protanopia, deuteranopia, tritanopia & more', icon: '◉', cat: 'Design' },
  { href: '/tools/scratchpad', title: 'Scratchpad', desc: 'Quick notes that auto-save to your browser', icon: '✍', cat: 'Text' },
  { href: '/tools/html-minify', title: 'HTML Minifier', desc: 'Strip comments, whitespace & reduce HTML file size', icon: 'Hm', cat: 'Code' },
  { href: '/tools/stopwatch', title: 'Stopwatch', desc: 'Count up with lap times and millisecond precision', icon: '⌚', cat: 'Fun' },
  { href: '/tools/contrast', title: 'Color Contrast Checker', desc: 'Check WCAG AA/AAA compliance between two colors', icon: '◐', cat: 'Design' },
  { href: '/tools/url-parser', title: 'URL Parser', desc: 'Parse URLs into components and query parameters', icon: '⇉', cat: 'Code' },
  { href: '/tools/sci-calc', title: 'Scientific Calculator', desc: 'Advanced math with trig, log, factorial & more', icon: '√', cat: 'Math' },
  { href: '/tools/image-crop', title: 'Image Cropper', desc: 'Select and crop a region from any image', icon: '⊟', cat: 'Media' },
  { href: '/tools/device-info', title: 'Device Info', desc: 'View browser, screen, network & system details', icon: 'ℹ', cat: 'System' },
  { href: '/tools/calendar', title: 'Calendar', desc: 'Monthly calendar view with navigation', icon: '◰', cat: 'Date' },
  { href: '/tools/json-to-ts', title: 'JSON to TypeScript', desc: 'Generate TypeScript interfaces from JSON objects', icon: 'TS', cat: 'Code' },
  { href: '/tools/text-encoder', title: 'Text Encoder', desc: 'Encode text as binary, hex, octal & decimal char codes', icon: '01', cat: 'Code' },
  { href: '/tools/color-harmonies', title: 'Color Harmonies', desc: 'Generate complementary, triadic, tetradic & analogous colors', icon: '◐', cat: 'Design' },
  { href: '/tools/battery', title: 'Battery Info', desc: 'View battery level, charging status and estimated time', icon: '⚡', cat: 'System' },
  { href: '/tools/image-filter', title: 'Image Filters', desc: 'Apply grayscale, sepia & invert filters with adjustable intensity', icon: '◑', cat: 'Media' },
  { href: '/tools/stt', title: 'Speech to Text', desc: 'Transcribe speech in real-time using your microphone', icon: '♩', cat: 'Media' },
  { href: '/tools/pomodoro', title: 'Pomodoro Timer', desc: 'Focus timer with work/break intervals and session tracking', icon: '⏲', cat: 'Fun' },
  { href: '/tools/color-names', title: 'CSS Color Names', desc: 'Browse and search all 148 named CSS colors with preview', icon: '◐', cat: 'Design' },
  { href: '/tools/css-units', title: 'CSS Units Converter', desc: 'Convert between px, em, rem, vw, vh, pt, cm, mm & more with live preview', icon: '⌗', cat: 'Code' },
  { href: '/tools/credit-card', title: 'Credit Card Validator', desc: 'Validate card numbers with Luhn algorithm and detect card type', icon: '⌘', cat: 'Security' },
  { href: '/tools/moon-phase', title: 'Moon Phase', desc: 'Find moon phase, illumination and age for any date', icon: '☾', cat: 'Date' },
  { href: '/tools/resolution', title: 'Resolution Calculator', desc: 'Calculate aspect ratio, megapixels, PPI and pixel pitch', icon: '□', cat: 'Media' },
  { href: '/tools/http-request', title: 'HTTP Request Builder', desc: 'Send HTTP requests with custom method, headers and body', icon: '⇶', cat: 'Network' },
  { href: '/tools/html2md', title: 'HTML to Markdown', desc: 'Convert HTML snippets to clean Markdown', icon: 'H↓', cat: 'Code' },
  { href: '/tools/ascii-art', title: 'ASCII Art Generator', desc: 'Transform text into ASCII art with multiple styles', icon: '▓', cat: 'Fun' },
  { href: '/tools/gzip', title: 'GZip Compressor', desc: 'Compress and decompress text with gzip', icon: '⊡', cat: 'Code' },
  { href: '/tools/box-model', title: 'CSS Box Model', desc: 'Visualize and generate CSS margin, border and padding', icon: '▢', cat: 'Design' },
  { href: '/tools/storage', title: 'Storage Explorer', desc: 'Browse, search, add and delete browser localStorage and sessionStorage', icon: '◫', cat: 'System' },
  { href: '/tools/svg-to-jsx', title: 'SVG to JSX', desc: 'Convert SVG markup to React JSX components', icon: '◈', cat: 'Code' },
  { href: '/tools/isbn', title: 'ISBN Validator', desc: 'Validate ISBN-10 and ISBN-13 with check digit & format conversion', icon: 'ISBN', cat: 'Code' },
  { href: '/tools/text-shadow', title: 'Text Shadow Generator', desc: 'Create multi-layer CSS text shadows with live preview', icon: 'T', cat: 'Design' },
  { href: '/tools/metronome', title: 'Metronome', desc: 'Audio metronome with BPM control and time signatures', icon: '♩', cat: 'Media' },
  { href: '/tools/audio-recorder', title: 'Audio Recorder', desc: 'Record audio from your microphone and download as WebM', icon: '♪', cat: 'Media' },
  { href: '/tools/keyboard', title: 'Keyboard Tester', desc: 'Test key presses with a visual keyboard and event log', icon: '⌨', cat: 'System' },
  { href: '/tools/flexbox', title: 'Flexbox Generator', desc: 'Visual CSS flexbox layout builder with live preview', icon: '≡', cat: 'Design' },
  { href: '/tools/rsa', title: 'RSA Key Generator', desc: 'Generate RSA public/private key pairs in PEM format', icon: '⚷', cat: 'Security' },
  { href: '/tools/ciphers', title: 'Ciphers', desc: 'Encode and decode text with Caesar, Atbash, ROT13 & Vigenere', icon: '⚔', cat: 'Security' },
  { href: '/tools/grid', title: 'CSS Grid Generator', desc: 'Visual CSS grid layout builder with live preview', icon: '⊞', cat: 'Design' },
  { href: '/tools/transition', title: 'Transition Generator', desc: 'Create and preview CSS transitions interactively', icon: '▶', cat: 'Design' },
  { href: '/tools/palette-from-image', title: 'Palette from Image', desc: 'Extract dominant colors from any image', icon: '◐', cat: 'Media' },
  { href: '/tools/image-compare', title: 'Image Comparer', desc: 'Compare two images with an interactive slider', icon: '⇔', cat: 'Media' },
  { href: '/tools/dotenv', title: 'Dotenv Parser', desc: 'Parse .env files and convert to JSON or YAML', icon: '.env', cat: 'Code' },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1] } },
};

const catStyles = {
  Text: 'bg-cat-text/10 text-cat-text border-cat-text/20',
  PDF: 'bg-cat-pdf/10 text-cat-pdf border-cat-pdf/20',
  Document: 'bg-cat-document/10 text-cat-document border-cat-document/20',
  Code: 'bg-cat-code/10 text-cat-code border-cat-code/20',
  Security: 'bg-cat-security/10 text-cat-security border-cat-security/20',
  Design: 'bg-cat-design/10 text-cat-design border-cat-design/20',
  Date: 'bg-cat-date/10 text-cat-date border-cat-date/20',
  Media: 'bg-cat-media/10 text-cat-media border-cat-media/20',
  Math: 'bg-cat-math/10 text-cat-math border-cat-math/20',
  Network: 'bg-cat-network/10 text-cat-network border-cat-network/20',
  DevOps: 'bg-cat-devops/10 text-cat-devops border-cat-devops/20',
  Fun: 'bg-cat-fun/10 text-cat-fun border-cat-fun/20',
  System: 'bg-cat-system/10 text-cat-system border-cat-system/20',
};

const iconColors = {
  Text: 'text-cat-text',
  PDF: 'text-cat-pdf',
  Document: 'text-cat-document',
  Code: 'text-cat-code',
  Security: 'text-cat-security',
  Design: 'text-cat-design',
  Date: 'text-cat-date',
  Media: 'text-cat-media',
  Math: 'text-cat-math',
  Network: 'text-cat-network',
  DevOps: 'text-cat-devops',
  Fun: 'text-cat-fun',
  System: 'text-cat-system',
};

export default function Home() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1] }}
        className="mb-14 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          {tools.length} powerful tools
        </div>
        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-text mb-4 tracking-tight leading-[1.1]">
          Everything you need,
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-cat-text bg-clip-text text-transparent">
            nothing you don't
          </span>
        </h1>
        <p className="text-text-secondary text-lg sm:text-xl max-w-lg mx-auto leading-relaxed">
          A playful toolkit for developers, creators, and tinkerers — all in one place.
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {tools.map((tool, i) => (
          <motion.div key={tool.href} variants={fadeUp}>
            <TiltCard href={tool.href}>
              <div className="flex items-start justify-between mb-4">
                <span className={`text-3xl ${iconColors[tool.cat] || 'text-text-tertiary'}`}>
                  {tool.icon}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${catStyles[tool.cat] || 'bg-badge-bg text-text-tertiary border-border'}`}>
                  {tool.cat}
                </span>
              </div>
              <h3 className="font-heading text-base font-semibold text-text mb-1.5">{tool.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{tool.desc}</p>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-16 text-center"
      >
        <p className="text-text-tertiary text-xs">
          All processing happens locally in your browser. Nothing leaves your machine.
        </p>
      </motion.div>
    </div>
  );
}
