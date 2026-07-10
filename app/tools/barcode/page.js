'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function BarcodePage() {
  const { addEntry } = useHistory();
  const [text, setText] = useState('Hello World');
  const [error, setError] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const canvasRef = useRef(null);

  const generate = useCallback(async () => {
    setError('');
    if (!text.trim()) { setError('Enter text to encode.'); return; }
    try {
      const JsBarcode = (await import('jsbarcode')).default;
      JsBarcode(canvasRef.current, text, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 16,
        margin: 10,
      });
      setImgUrl(canvasRef.current.toDataURL('image/png'));
      addEntry('Barcode Generator');
    } catch (e) {
      setError('Could not generate barcode. Ensure jsbarcode is installed.');
    }
  }, [text, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">▆</span>
        <h1 className="font-heading text-2xl font-bold text-text">Barcode Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Text to Encode</label>
              <input value={text} onChange={(e) => setText(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" placeholder="Enter text or number..." />
            </div>
            <button onClick={generate} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate Barcode</button>
            <div className="text-xs text-text-tertiary">Format: CODE128. Supports alphanumeric characters.</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 text-center">
            <span className="text-xs text-text-tertiary mb-3 block">Barcode</span>
            <canvas ref={canvasRef} className="hidden" />
            {imgUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img src={imgUrl} alt="Barcode" className="max-w-full bg-white rounded-lg p-3" />
                <CopyButton text={imgUrl} />
                <span className="text-[10px] text-text-tertiary">Click to copy data URI</span>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-surface rounded-lg border border-border/50 p-8 min-h-[120px]">
                <span className="text-text-tertiary text-sm">Click generate to create barcode</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
