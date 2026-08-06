'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const CSS_TO_TW = [
  { pattern: /display\s*:\s*flex/g, tw: 'flex' },
  { pattern: /display\s*:\s*grid/g, tw: 'grid' },
  { pattern: /display\s*:\s*block/g, tw: 'block' },
  { pattern: /display\s*:\s*inline-block/g, tw: 'inline-block' },
  { pattern: /display\s*:\s*inline/g, tw: 'inline' },
  { pattern: /display\s*:\s*none/g, tw: 'hidden' },
  { pattern: /display\s*:\s*inline-flex/g, tw: 'inline-flex' },
  { pattern: /flex-direction\s*:\s*column/g, tw: 'flex-col' },
  { pattern: /flex-direction\s*:\s*row/g, tw: 'flex-row' },
  { pattern: /flex-wrap\s*:\s*wrap/g, tw: 'flex-wrap' },
  { pattern: /justify-content\s*:\s*flex-start/g, tw: 'justify-start' },
  { pattern: /justify-content\s*:\s*flex-end/g, tw: 'justify-end' },
  { pattern: /justify-content\s*:\s*center/g, tw: 'justify-center' },
  { pattern: /justify-content\s*:\s*space-between/g, tw: 'justify-between' },
  { pattern: /justify-content\s*:\s*space-around/g, tw: 'justify-around' },
  { pattern: /justify-content\s*:\s*space-evenly/g, tw: 'justify-evenly' },
  { pattern: /align-items\s*:\s*flex-start/g, tw: 'items-start' },
  { pattern: /align-items\s*:\s*flex-end/g, tw: 'items-end' },
  { pattern: /align-items\s*:\s*center/g, tw: 'items-center' },
  { pattern: /align-items\s*:\s*stretch/g, tw: 'items-stretch' },
  { pattern: /align-items\s*:\s*baseline/g, tw: 'items-baseline' },
  { pattern: /position\s*:\s*relative/g, tw: 'relative' },
  { pattern: /position\s*:\s*absolute/g, tw: 'absolute' },
  { pattern: /position\s*:\s*fixed/g, tw: 'fixed' },
  { pattern: /position\s*:\s*sticky/g, tw: 'sticky' },
  { pattern: /overflow\s*:\s*hidden/g, tw: 'overflow-hidden' },
  { pattern: /overflow\s*:\s*auto/g, tw: 'overflow-auto' },
  { pattern: /overflow\s*:\s*scroll/g, tw: 'overflow-scroll' },
  { pattern: /overflow-x\s*:\s*auto/g, tw: 'overflow-x-auto' },
  { pattern: /overflow-y\s*:\s*auto/g, tw: 'overflow-y-auto' },
  { pattern: /text-align\s*:\s*center/g, tw: 'text-center' },
  { pattern: /text-align\s*:\s*left/g, tw: 'text-left' },
  { pattern: /text-align\s*:\s*right/g, tw: 'text-right' },
  { pattern: /font-weight\s*:\s*bold/g, tw: 'font-bold' },
  { pattern: /font-weight\s*:\s*semibold/g, tw: 'font-semibold' },
  { pattern: /font-weight\s*:\s*medium/g, tw: 'font-medium' },
  { pattern: /font-weight\s*:\s*normal/g, tw: 'font-normal' },
  { pattern: /font-style\s*:\s*italic/g, tw: 'italic' },
  { pattern: /text-decoration\s*:\s*underline/g, tw: 'underline' },
  { pattern: /text-decoration\s*:\s*line-through/g, tw: 'line-through' },
  { pattern: /text-transform\s*:\s*uppercase/g, tw: 'uppercase' },
  { pattern: /text-transform\s*:\s*lowercase/g, tw: 'lowercase' },
  { pattern: /text-transform\s*:\s*capitalize/g, tw: 'capitalize' },
  { pattern: /white-space\s*:\s*nowrap/g, tw: 'whitespace-nowrap' },
  { pattern: /white-space\s*:\s*pre-wrap/g, tw: 'whitespace-pre-wrap' },
  { pattern: /word-break\s*:\s*break-all/g, tw: 'break-all' },
  { pattern: /cursor\s*:\s*pointer/g, tw: 'cursor-pointer' },
  { pattern: /cursor\s*:\s*not-allowed/g, tw: 'cursor-not-allowed' },
  { pattern: /cursor\s*:\s*default/g, tw: 'cursor-default' },
  { pattern: /user-select\s*:\s*none/g, tw: 'select-none' },
  { pattern: /opacity\s*:\s*0/g, tw: 'opacity-0' },
  { pattern: /opacity\s*:\s*0\.5/g, tw: 'opacity-50' },
  { pattern: /opacity\s*:\s*1/g, tw: 'opacity-100' },
  { pattern: /z-index\s*:\s*(-?\d+)/g, tw: 'z-$1' },
  { pattern: /gap\s*:\s*(\d+(\.\d+)?)px/g, tw: (_, v) => `gap-[${v}px]` },
  { pattern: /row-gap\s*:\s*(\d+(\.\d+)?)px/g, tw: (_, v) => `gap-y-[${v}px]` },
  { pattern: /column-gap\s*:\s*(\d+(\.\d+)?)px/g, tw: (_, v) => `gap-x-[${v}px]` },
  { pattern: /border-radius\s*:\s*(\d+(\.\d+)?)px/g, tw: (_, v) => parseFloat(v) <= 4 ? 'rounded-sm' : parseFloat(v) <= 8 ? 'rounded' : parseFloat(v) <= 12 ? 'rounded-md' : parseFloat(v) <= 16 ? 'rounded-lg' : parseFloat(v) <= 9999 ? 'rounded-full' : `rounded-[${v}px]` },
  { pattern: /border-radius\s*:\s*50%/g, tw: 'rounded-full' },
  { pattern: /border\s*:\s*(\d+)px\s+solid/g, tw: (_, w) => `border-${w}` },
  { pattern: /border-width\s*:\s*(\d+)px/g, tw: (_, w) => `border-${w}` },
  { pattern: /margin\s*:\s*auto/g, tw: 'm-auto' },
  { pattern: /text-decoration\s*:\s*none/g, tw: 'no-underline' },
  { pattern: /list-style\s*:\s*none/g, tw: 'list-none' },
  { pattern: /appearance\s*:\s*none/g, tw: 'appearance-none' },
  { pattern: /outline\s*:\s*none/g, tw: 'outline-none' },
  { pattern: /box-shadow\s*:\s*none/g, tw: 'shadow-none' },
  { pattern: /resize\s*:\s*none/g, tw: 'resize-none' },
  { pattern: /resize\s*:\s*both/g, tw: 'resize' },
];

function convertMarginPadding(css, prop, twPrefix) {
  const vals = css.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`));
  if (!vals) return [];
  const parts = vals[1].trim().split(/\s+/);
  const tw = [];
  if (parts.length === 1) tw.push(`${twPrefix}-${parts[0] === '0' ? '0' : `[${parts[0]}]`}`);
  else if (parts.length === 2) {
    tw.push(`${twPrefix}y-${parts[0] === '0' ? '0' : `[${parts[0]}]`}`);
    tw.push(`${twPrefix}x-${parts[1] === '0' ? '0' : `[${parts[1]}]`}`);
  } else if (parts.length === 4) {
    tw.push(`${twPrefix}t-${parts[0] === '0' ? '0' : `[${parts[0]}]`}`);
    tw.push(`${twPrefix}r-${parts[1] === '0' ? '0' : `[${parts[1]}]`}`);
    tw.push(`${twPrefix}b-${parts[2] === '0' ? '0' : `[${parts[2]}]`}`);
    tw.push(`${twPrefix}l-${parts[3] === '0' ? '0' : `[${parts[3]}]`}`);
  }
  return tw;
}

function convertColor(css, prop, twPrefix) {
  const match = css.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`));
  if (!match) return [];
  const val = match[1].trim();
  const twColors = {
    'black': 'black', 'white': 'white', 'transparent': 'transparent',
    'red': 'red-500', 'blue': 'blue-500', 'green': 'green-500',
    'gray': 'gray-500', 'grey': 'gray-500',
  };
  if (twColors[val]) return [`${twPrefix}-${twColors[val]}`];
  if (val.startsWith('#')) return [`${twPrefix}-[${val}]`];
  if (val.startsWith('rgb')) return [`${twPrefix}-[${val}]`];
  return [`${twPrefix}-[${val}]`];
}

function convertSize(css, prop, twPrefix) {
  const match = css.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`));
  if (!match) return [];
  const val = match[1].trim();
  if (val === 'auto') return [`${twPrefix}-auto`];
  if (val === '100%') return [`${twPrefix}-full`];
  if (val === '0') return [`${twPrefix}-0`];
  if (/^\d+(\.\d+)?px$/.test(val)) return [`${twPrefix}-[${val}]`];
  if (/^\d+(\.\d+)?%$/.test(val)) return [`${twPrefix}-[${val}]`];
  return [`${twPrefix}-[${val}]`];
}

function convertToTailwind(css) {
  let clean = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
  const classes = [];

  for (const rule of CSS_TO_TW) {
    const before = clean;
    clean = clean.replace(rule.pattern, (match, ...args) => {
      const tw = typeof rule.tw === 'function' ? rule.tw(match, ...args) : rule.tw;
      classes.push(tw);
      return '';
    });
  }

  classes.push(...convertMarginPadding(clean, 'margin', 'm'));
  classes.push(...convertMarginPadding(clean, 'padding', 'p'));
  classes.push(...convertColor(clean, 'color', 'text'));
  classes.push(...convertColor(clean, 'background-color', 'bg'));
  classes.push(...convertColor(clean, 'border-color', 'border'));
  classes.push(...convertSize(clean, 'width', 'w'));
  classes.push(...convertSize(clean, 'height', 'h'));
  classes.push(...convertSize(clean, 'min-width', 'min-w'));
  classes.push(...convertSize(clean, 'max-width', 'max-w'));
  classes.push(...convertSize(clean, 'min-height', 'min-h'));
  classes.push(...convertSize(clean, 'max-height', 'max-h'));

  const fontSize = clean.match(/font-size\s*:\s*([^;]+)/);
  if (fontSize) {
    const val = fontSize[1].trim();
    if (/^\d+(\.\d+)?px$/.test(val)) classes.push(`text-[${val}]`);
  }
  const lineHeight = clean.match(/line-height\s*:\s*([^;]+)/);
  if (lineHeight) {
    const val = lineHeight[1].trim();
    if (/^\d+(\.\d+)?$/.test(val)) classes.push(`leading-${val === '1.5' ? 'normal' : `[${val}]`}`);
    else if (/^\d+(\.\d+)?px$/.test(val)) classes.push(`leading-[${val}]`);
  }
  const letterSpacing = clean.match(/letter-spacing\s*:\s*([^;]+)/);
  if (letterSpacing) {
    const val = letterSpacing[1].trim();
    if (val === 'normal') classes.push('tracking-normal');
    else if (/^-?(\d+(\.\d+)?)(em|px)$/.test(val)) classes.push(`tracking-[${val}]`);
  }
  const transition = clean.match(/transition\s*:\s*([^;]+)/);
  if (transition) classes.push('transition-all');
  const transform = clean.match(/transform\s*:\s*([^;]+)/);
  if (transform) {
    if (transform[1].includes('rotate')) classes.push('rotate-0');
    if (transform[1].includes('scale')) classes.push('scale-100');
  }
  const animation = clean.match(/animation\s*:\s*([^;]+)/);
  if (animation) classes.push(`animate-[${animation[1].trim()}]`);

  return [...new Set(classes)];
}

export default function CssToTailwindPage() {
  const { addEntry } = useHistory();
  const [css, setCss] = useState('');
  const [tailwind, setTailwind] = useState('');

  const handleConvert = useCallback(() => {
    if (!css.trim()) { setTailwind(''); return; }
    const classes = convertToTailwind(css);
    setTailwind(classes.join(' '));
    addEntry('CSS to Tailwind');
  }, [css, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⇄</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS to Tailwind</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">CSS Input</span>
              {css && <CopyButton text={css} />}
            </div>
            <textarea value={css} onChange={e => setCss(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder={`display: flex;\njustify-content: center;\npadding: 16px;\ncolor: #333;\nborder-radius: 8px;\nbackground-color: white;\nbox-shadow: 0 2px 4px rgba(0,0,0,0.1);`} />
            <button onClick={handleConvert}
              className="w-full mt-3 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Convert to Tailwind
            </button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">Tailwind Output</span>
              {tailwind && <CopyButton text={tailwind} />}
            </div>
            <textarea value={tailwind} readOnly rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Tailwind classes will appear here..." />
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-5">
        <div className="p-4">
          <span className="text-xs text-text-tertiary font-semibold block mb-2">Supported Properties</span>
          <div className="flex flex-wrap gap-1.5">
            {['display', 'flex', 'grid', 'position', 'overflow', 'text-align', 'font-weight', 'text-transform', 'cursor', 'border-radius', 'margin', 'padding', 'color', 'background-color', 'width', 'height', 'opacity', 'z-index', 'gap', 'box-shadow'].map(p => (
              <span key={p} className="px-2 py-0.5 text-[10px] font-mono rounded bg-surface border border-border text-text-tertiary">{p}</span>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
