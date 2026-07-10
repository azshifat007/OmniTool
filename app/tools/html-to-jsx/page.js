'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function htmlToJsx(html, componentName) {
  let result = html
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/tabindex=/g, 'tabIndex=')
    .replace(/autocomplete=/g, 'autoComplete=')
    .replace(/autofocus=/g, 'autoFocus=')
    .replace(/autoplay=/g, 'autoPlay=')
    .replace(/enctype=/g, 'encType=')
    .replace(/frameborder=/g, 'frameBorder=')
    .replace(/inputmode=/g, 'inputMode=')
    .replace(/maxlength=/g, 'maxLength=')
    .replace(/minlength=/g, 'minLength=')
    .replace(/novalidate=/g, 'noValidate=')
    .replace(/readonly=/g, 'readOnly=')
    .replace(/srcdoc=/g, 'srcDoc=')
    .replace(/srclang=/g, 'srcLang=')
    .replace(/srcset=/g, 'srcSet=')
    .replace(/usemap=/g, 'useMap=')
    .replace(/colspan=/g, 'colSpan=')
    .replace(/rowspan=/g, 'rowSpan=')
    .replace(/contenteditable=/g, 'contentEditable=')
    .replace(/crossorigin=/g, 'crossOrigin=')
    .replace(/(\w+)-(\w)(\w*)=/g, (_, p1, p2, p3) => `${p1}${p2.toUpperCase()}${p3}=`)
    .replace(/checked=""/g, 'checked={true}')
    .replace(/disabled=""/g, 'disabled={true}')
    .replace(/selected=""/g, 'selected={true}')
    .replace(/hidden=""/g, 'hidden={true}')
    .replace(/\/>/g, ' />');
  const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  selfClosing.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b([^>]*[^/])>`, 'gi');
    result = result.replace(regex, `<${tag}$1 />`);
  });
  result = result.replace(/<svg([^>]*)>/gi, (m, a) => `<svg${a}>\n`).replace(/<\/svg>/gi, '</svg>');
  result = result.replace(/style="([^"]*)"/g, (_, s) => {
    const styles = s.split(';').filter(Boolean).map(st => {
      const [prop, val] = st.split(':').map(p => p.trim());
      if (!prop || !val) return '';
      const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const v = isNaN(val) ? `'${val}'` : val;
      return `${camel}: ${v}`;
    }).filter(Boolean).join(', ');
    return styles ? `style={{ ${styles} }}` : '';
  });

  if (componentName) {
    result = `import React from 'react';\n\nexport default function ${componentName}() {\n  return (\n${result.split('\n').map(l => '    ' + l).join('\n')}\n  );\n}`;
  }
  return result;
}

const examples = [
  '<div class="container"><h1>Hello World</h1><p>This is a paragraph.</p></div>',
  '<button class="btn" onclick="handleClick()" disabled="">Click Me</button>',
  '<input type="text" placeholder="Enter name" autofocus="" maxlength="50" />',
  '<label for="email">Email:</label><input id="email" type="email" autocomplete="email" />',
];

export default function HtmlToJsxPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [componentName, setComponentName] = useState('MyComponent');
  const [wrap, setWrap] = useState(false);

  const convert = useCallback(() => {
    if (!input.trim()) return;
    addEntry('HTML to JSX');
    const jsx = htmlToJsx(input, wrap ? componentName : '');
    setOutput(jsx);
  }, [input, componentName, wrap, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⇄</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTML to JSX Converter</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, i) => (
              <button key={i} onClick={() => setInput(ex)}
                className="px-2.5 py-1 text-xs rounded-lg bg-surface text-text-secondary border border-border/50 hover:border-primary/40 hover:text-text transition-all cursor-pointer">
                Example {i + 1}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-text-tertiary mb-2 block">HTML Input</label>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder='<div class="container"><h1>Hello</h1></div>'
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors min-h-[160px] resize-y" />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer">
              <input type="checkbox" checked={wrap} onChange={e => setWrap(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface accent-primary cursor-pointer" />
              Wrap as React component
            </label>
            {wrap && (
              <input value={componentName} onChange={e => setComponentName(e.target.value)}
                placeholder="ComponentName"
                className="flex-1 bg-surface rounded-lg px-3 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors max-w-[180px]" />
            )}
          </div>

          <button onClick={convert} disabled={!input.trim()}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
            Convert to JSX
          </button>
        </div>
      </GlassCard>

      {output && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">JSX Output</span>
              <CopyButton text={output} />
            </div>
            <pre className="text-xs font-mono text-text bg-surface rounded-lg p-3 border border-border/50 overflow-x-auto max-h-[400px] whitespace-pre-wrap break-all">{output}</pre>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
