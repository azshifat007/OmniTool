'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const EXAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>This is a paragraph with some text in it.</p>
    <ul>
      <li>Item one</li>
      <li>Item two</li>
      <li>Item three</li>
    </ul>
  </div>
</body>
</html>`;

const SELF_CLOSING = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function detectHtmlError(html) {
  const stack = [];
  const tagRegex = /<\/?([\w-]+)([^>]*?)>/g;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const pos = match.index;
    const line = html.substring(0, pos).split('\n').length;

    if (SELF_CLOSING.has(tagName)) continue;

    if (fullTag.startsWith('</')) {
      if (stack.length === 0) {
        return { message: `Unexpected closing tag <\/${tagName}> at line ${line}`, line };
      }
      const last = stack.pop();
      if (last.tagName !== tagName) {
        return {
          message: `Mismatched tags: <${last.tagName}> opened at line ${last.line} closed by <\/${tagName}> at line ${line}`,
          line,
        };
      }
    } else if (!fullTag.endsWith('/>')) {
      stack.push({ tagName, line });
    }
  }
  if (stack.length > 0) {
    const remaining = stack.map((t) => `<${t.tagName}> at line ${t.line}`).join(', ');
    return { message: `Unclosed tags: ${remaining}`, line: stack[stack.length - 1].line };
  }
  return null;
}

function collapseNewlines(text) {
  return text.replace(/\n\s*\n\s*/g, '\n');
}

function formatHtml(html, collapseNewlinesInText) {
  let result = html;
  if (collapseNewlinesInText) {
    result = collapseNewlines(result);
  }

  let formatted = '';
  let indentLevel = 0;
  const indent = '  ';
  const lines = result
    .replace(/\r\n?/g, '\n')
    .replace(/>\s*</g, '>\n<')
    .replace(/(>)([^<]+)/g, '$1\n$2\n')
    .replace(/([^>]+)(<)/g, '$1\n$2')
    .split('\n');

  for (let raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    const isClosing = trimmed.startsWith('</');
    const isComment = trimmed.startsWith('<!--');
    const isDoctype = trimmed.startsWith('<!');
    const isSelfClosingTag = SELF_CLOSING.has(lower.replace(/^<|>$/g, '').split(/\s/)[0]);
    const isOpening = trimmed.startsWith('<') && !isClosing && !isComment && !isDoctype && !trimmed.endsWith('/>') && !isSelfClosingTag;

    if (isClosing && !isComment) {
      indentLevel--;
    }

    formatted += indent.repeat(Math.max(0, indentLevel)) + trimmed + '\n';

    if (isOpening && !isSelfClosingTag) {
      indentLevel++;
    }
  }

  return formatted.trim();
}

function minifyHtml(html) {
  return html
    .replace(/>\s+</g, '><')
    .replace(/>\s+([^<])/g, '>$1')
    .replace(/([^>])\s+</g, '$1<')
    .replace(/<!--.*?-->/gs, '')
    .trim();
}

export default function HtmlFormatterPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(EXAMPLE_HTML);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [collapseNewlinesInText, setCollapseNewlinesInText] = useState(false);

  const handleFormat = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    setError('');

    const err = detectHtmlError(input);
    if (err) {
      setError(err.message);
      setOutput('');
      addEntry('HTML Formatter');
      return;
    }

    try {
      const result = formatHtml(input, collapseNewlinesInText);
      setOutput(result);
      addEntry('HTML Formatter');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, collapseNewlinesInText, addEntry]);

  const inputSize = new TextEncoder().encode(input).length;
  const outputSize = new TextEncoder().encode(output).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTML Formatter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">HTML Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste HTML here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-tertiary">{inputSize} bytes</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-text-tertiary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collapseNewlinesInText}
                    onChange={(e) => setCollapseNewlinesInText(e.target.checked)}
                    className="accent-primary"
                  />
                  Collapse newlines
                </label>
                <button onClick={handleFormat} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                  Format
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-text-tertiary">Formatted HTML</label>
              <div className="flex items-center gap-2">
                {output && (
                  <>
                    {inputSize > 0 && (
                      <span className="text-xs text-text-tertiary">
                        {outputSize - inputSize > 0 ? '+' : ''}{outputSize - inputSize} bytes
                      </span>
                    )}
                    <CopyButton text={output} />
                  </>
                )}
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Formatted HTML will appear here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
            />
          </div>
        </GlassCard>
      </div>

      {error && (
        <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">
          {error}
        </div>
      )}
    </motion.div>
  );
}
