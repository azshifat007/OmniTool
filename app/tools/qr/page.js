'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function QrPage() {
  const { addEntry } = useHistory();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const generate = useCallback(async () => {
    setError('');
    if (!text.trim()) { setError('Enter text or URL to generate.'); return; }
    try {
      const QRCode = (await import('qrcode')).default;
      await QRCode.toCanvas(canvasRef.current, text, {
        width: 300,
        margin: 2,
        color: { dark: '#1A1A2E', light: 'transparent' },
      });
      addEntry('QR Code Generator');
    } catch (e) {
      setError(e.message);
    }
  }, [text, addEntry]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">▦</span>
        <h1 className="font-heading text-2xl font-bold text-text">QR Code Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Text or URL</label>
            <div className="flex gap-2 mb-3">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com"
                className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              <button onClick={generate} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
            </div>
            {error && <p className="text-cat-text text-xs">{error}</p>}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 flex flex-col items-center gap-3">
            <canvas ref={canvasRef} className="rounded-lg bg-surface" />
            {text && (
              <button onClick={download} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                Download PNG
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
