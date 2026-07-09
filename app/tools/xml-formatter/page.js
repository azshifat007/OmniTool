'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const EXAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<project name="OmniTool" version="2.1.0">
  <description>A collection of developer utilities</description>
  <dependencies>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>core-lib</artifactId>
      <version>3.2.1</version>
    </dependency>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>utils-lib</artifactId>
      <version>1.0.0</version>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <name>compiler</name>
        <option name="target" value="es2022"/>
        <option name="optimize" value="true"/>
      </plugin>
    </plugins>
  </build>
</project>`;

function detectXmlError(xml) {
  const stack = [];
  const tagRegex = /<\/?([\w:-]+)([^>]*?)\/?>/g;
  let match;
  while ((match = tagRegex.exec(xml)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const pos = match.index;
    const line = xml.substring(0, pos).split('\n').length;

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

function formatXml(xml) {
  let formatted = '';
  let indentLevel = 0;
  const indent = '  ';
  const lines = xml
    .replace(/\r\n?/g, '\n')
    .replace(/>\s*</g, '>\n<')
    .split('\n');

  for (let raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const isClosing = trimmed.startsWith('</');
    const isSelfClosing = trimmed.endsWith('/>');
    const isComment = trimmed.startsWith('<!--');
    const isDeclaration = trimmed.startsWith('<?');

    if (isClosing && !isComment) {
      indentLevel--;
    }

    formatted += indent.repeat(Math.max(0, indentLevel)) + trimmed + '\n';

    if (!isClosing && !isSelfClosing && !isComment && !isDeclaration && !trimmed.endsWith('</')) {
      indentLevel++;
    }
  }

  return formatted.trim();
}

function minifyXml(xml) {
  return xml
    .replace(/>\s+</g, '><')
    .replace(/>\s+([^<])/g, '>$1')
    .replace(/([^>])\s+</g, '$1<')
    .trim();
}

export default function XmlFormatterPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(EXAMPLE_XML);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [minify, setMinify] = useState(false);

  const handleFormat = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    setError('');

    const err = detectXmlError(input);
    if (err) {
      setError(err.message);
      setOutput('');
      addEntry('XML Formatter');
      return;
    }

    try {
      const result = minify ? minifyXml(input) : formatXml(input);
      setOutput(result);
      addEntry('XML Formatter');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, minify, addEntry]);

  const inputSize = new TextEncoder().encode(input).length;
  const outputSize = new TextEncoder().encode(output).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">&lt;/&gt;</span>
        <h1 className="font-heading text-2xl font-bold text-text">XML Formatter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">XML Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste XML here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-tertiary">{inputSize} bytes</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-text-tertiary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minify}
                    onChange={(e) => setMinify(e.target.checked)}
                    className="accent-primary"
                  />
                  Minify
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
              <label className="text-xs text-text-tertiary">
                {minify ? 'Minified XML' : 'Formatted XML'}
              </label>
              <div className="flex items-center gap-2">
                {output && (
                  <>
                    {!minify && inputSize > 0 && (
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
              placeholder="Formatted XML will appear here..."
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
