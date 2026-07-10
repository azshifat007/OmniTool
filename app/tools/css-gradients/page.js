'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const GRADIENTS = [
  { name: 'Sunset', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Mint', css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Aurora', css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Fire', css: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)' },
  { name: 'Night', css: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)' },
  { name: 'Lime', css: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { name: 'Rose', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Lavender', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Peach', css: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
  { name: 'Arctic', css: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { name: 'Candy', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' },
  { name: 'Forest', css: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Twilight', css: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
  { name: 'Coral', css: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)' },
  { name: 'Honey', css: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { name: 'Slate', css: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
  { name: 'Berry', css: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)' },
  { name: 'Autumn', css: 'linear-gradient(135deg, #e44d26 0%, #f16529 50%, #f7971e 100%)' },
  { name: 'Sky', css: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
];

export default function CssGradientsPage() {
  const { addEntry } = useHistory();
  const [copied, setCopied] = useState(null);

  const handleCopy = useCallback((css, name) => {
    navigator.clipboard.writeText(css);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
    addEntry('CSS Gradient Library');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◐</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Gradient Library</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {GRADIENTS.map(g => (
          <GlassCard key={g.name}>
            <div className="p-0">
              <div className="h-24 rounded-t-2xl" style={{ background: g.css }} />
              <div className="p-3">
                <div className="text-sm font-medium text-text mb-2">{g.name}</div>
                <button onClick={() => handleCopy(g.css, g.name)}
                  className="w-full px-2 py-1.5 text-[11px] font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text hover:border-text-tertiary transition-all cursor-pointer">
                  {copied === g.name ? 'Copied!' : 'Copy CSS'}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}
