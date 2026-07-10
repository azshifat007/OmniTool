'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function TerraformPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('resource "aws_instance" "web" {\n  ami           = "ami-abc123"\n  instance_type = "t3.micro"\n\n  tags = {\n    Name = "web-server"\n  }\n}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const format = useCallback(() => {
    setError('');
    const lines = input.split('\n');
    let indent = 0;
    const out = [];
    for (const raw of lines) {
      const t = raw.trim();
      if (!t) { out.push(''); continue; }
      const dedent = t.startsWith('}') || t.startsWith(']') || t.startsWith(')');
      if (dedent && indent > 0) indent--;
      out.push('  '.repeat(indent) + t);
      const opens = (t.match(/[{[]/g) || []).length;
      const closes = (t.match(/[}\]]/g) || []).length;
      indent += opens - closes;
      if (indent < 0) indent = 0;
    }
    setOutput(out.join('\n'));
    addEntry('Terraform Formatter');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">⊞</span>
        <h1 className="font-heading text-2xl font-bold text-text">Terraform Formatter</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">HCL Input</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            <button onClick={format} className="mt-3 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Format</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Formatted</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[280px]">{output || <span className="text-text-tertiary">Click Format...</span>}</pre>
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
