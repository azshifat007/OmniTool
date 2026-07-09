'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const attrMap = {
  'class': 'className',
  'for': 'htmlFor',
  'tabindex': 'tabIndex',
  'autofocus': 'autoFocus',
  'autocomplete': 'autoComplete',
  'contenteditable': 'contentEditable',
  'crossorigin': 'crossOrigin',
  'datetime': 'dateTime',
  'enctype': 'encType',
  'formaction': 'formAction',
  'formenctype': 'formEncType',
  'formmethod': 'formMethod',
  'formnovalidate': 'formNoValidate',
  'formtarget': 'formTarget',
  'hrefLang': 'hrefLang',
  'inputmode': 'inputMode',
  'ismap': 'isMap',
  'itemid': 'itemID',
  'itemprop': 'itemProp',
  'itemref': 'itemRef',
  'itemscope': 'itemScope',
  'itemtype': 'itemType',
  'maxlength': 'maxLength',
  'minlength': 'minLength',
  'novalidate': 'noValidate',
  'playsinline': 'playsInline',
  'readonly': 'readOnly',
  'referrerpolicy': 'referrerPolicy',
  'rowspan': 'rowSpan',
  'srcdoc': 'srcDoc',
  'srclang': 'srcLang',
  'srcset': 'srcSet',
  'usemap': 'useMap',
  'viewBox': 'viewBox',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-miterlimit': 'strokeMiterlimit',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'font-style': 'fontStyle',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'alignment-baseline': 'alignmentBaseline',
  'dominant-baseline': 'dominantBaseline',
};

function convertAttr(name) {
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  if (name.startsWith('on')) return name.toLowerCase();
  return attrMap[name] || name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function convertValue(name, value) {
  if (value === '' || value === null || value === undefined) return '';
  if (value === 'true' && ['autofocus', 'autoplay', 'checked', 'controls', 'disabled', 'hidden', 'ismap', 'itemscope', 'loop', 'multiple', 'muted', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'selected'].includes(name)) {
    return name === value ? '' : `{${value === 'true'}}`;
  }
  if (!isNaN(value) && value !== '' && !value.startsWith('0')) return `{${value}}`;
  return `"${value.replace(/"/g, '&quot;').replace(/'/g, "\\'")}"`;
}

function svgToJsx(svg) {
  let jsx = svg;
  jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');
  jsx = jsx.replace(/<\?xml[^>]*\?>/g, '');
  jsx = jsx.replace(/<!DOCTYPE[^>]*>/g, '');

  const attrRegex = /(\S+)=["']([^"']*)["']/g;
  let result;
  const replacements = [];
  while ((result = attrRegex.exec(jsx)) !== null) {
    const full = result[0];
    const name = result[1];
    const value = result[2];
    const newName = convertAttr(name);
    const newValue = convertValue(newName, value);
    const replacement = newValue ? `${newName}=${newValue}` : newName;
    replacements.push({ full, replacement });
  }

  for (const r of replacements) {
    jsx = jsx.replace(r.full, r.replacement);
  }

  jsx = jsx.replace(/\/>/g, ' />');
  jsx = jsx.replace(/>&#x([0-9A-Fa-f]+);/g, (_, code) => {
    const n = parseInt(code, 16);
    return n >= 0x20 ? `>{String.fromCodePoint(n)}` : `>&#x${code};`;
  });
  jsx = jsx.replace(/style=["']([^"']*)["']/g, (_, s) => {
    const styles = s.split(';').filter(Boolean).map((st) => {
      const [prop, val] = st.split(':').map((x) => x.trim());
      if (!prop || !val) return '';
      const camel = prop.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
      return `${camel}: "${val}"`;
    }).filter(Boolean).join(', ');
    return `style={{${styles}}}`;
  });

  return jsx.trim();
}

const examples = [
  'Simple Circle',
  'Rectangle',
  'Icon Path',
];

const exampleSvgs = [
  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#3b82f6" stroke="#1d4ed8" stroke-width="4"/></svg>',
  '<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="180" height="80" rx="10" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="5,5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
];

export default function SvgToJsxPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [componentName, setComponentName] = useState('SvgIcon');
  const [wrapComponent, setWrapComponent] = useState(true);

  const convert = () => {
    const svg = svgToJsx(input);
    if (wrapComponent) {
      setOutput(`function ${componentName}(props) {\n  return (\n    ${svg.replace(/\n/g, '\n    ')}\n  );\n}\n\nexport default ${componentName};`);
    } else {
      setOutput(svg);
    }
    addEntry('SVG to JSX');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">◈</span>
        <h1 className="font-heading text-2xl font-bold text-text">SVG to JSX</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-text-tertiary">SVG Input</label>
              <button onClick={convert} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} placeholder="Paste SVG code here..."
              className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-text-tertiary mb-1 block">Component name</label>
                <input value={componentName} onChange={(e) => setComponentName(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-4">
                <input type="checkbox" checked={wrapComponent} onChange={() => setWrapComponent(!wrapComponent)}
                  className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                <span className="text-[10px] text-text-secondary">Wrap component</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {examples.map((name, i) => (
                <button key={name} onClick={() => setInput(exampleSvgs[i])}
                  className="text-[10px] px-2 py-1 rounded bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">{name}</button>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">JSX Output</span>
              <CopyButton text={output} />
            </div>
            <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border overflow-x-auto whitespace-pre-wrap break-all max-h-96">{output || <span className="text-text-tertiary">Click Convert</span>}</pre>
          </div>
        </GlassCard>
      </div>

      {input && (
        <GlassCard className="mt-4">
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Preview</span>
            <div className="bg-surface rounded-lg p-4 border border-border flex items-center justify-center" style={{ maxWidth: 200, margin: '0 auto' }}>
              <div dangerouslySetInnerHTML={{ __html: input }} />
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
