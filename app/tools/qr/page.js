'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';
import QRCode from 'qrcode';

const presets = [
  { label: 'URL', desc: 'https://...' },
  { label: 'Text', desc: 'Plain text' },
  { label: 'Phone', desc: '+1234567890' },
  { label: 'SMS', desc: 'number|message' },
];

const ecLevels = [
  { value: 'L', label: 'L (7%)' },
  { value: 'M', label: 'M (15%)' },
  { value: 'Q', label: 'Q (25%)' },
  { value: 'H', label: 'H (30%)' },
];

export default function QrPage() {
  const { addEntry } = useHistory();
  const [text, setText] = useState('https://omni-aziz.vercel.app');
  const [error, setError] = useState('');
  const [fgColor, setFgColor] = useState('#1A1A2E');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [ecLevel, setEcLevel] = useState('M');
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(2);
  const [qrInfo, setQrInfo] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  const generate = useCallback(async () => {
    setError('');
    setQrInfo(null);
    if (!text.trim()) return;
    try {
      await QRCode.toCanvas(canvasRef.current, text.trim(), {
        width: size,
        margin,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: ecLevel,
      });
      addEntry('QR Code Generator');

      const mods = canvasRef.current.width / (21 + margin * 2 + (17 * 4));
      const version = Math.max(1, Math.ceil((canvasRef.current.width / mods - 17) / 4));
      setQrInfo({
        version: Math.min(40, Math.max(1, Math.floor((size - margin * 2 - 1) / 25))),
        modules: `${canvasRef.current.width}×${canvasRef.current.height}px`,
        ec: ecLevel,
      });
    } catch (e) {
      setError(e.message);
    }
  }, [text, size, margin, fgColor, bgColor, ecLevel, addEntry]);

  useEffect(() => {
    if (!text.trim()) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(generate, 400);
    return () => clearTimeout(timerRef.current);
  }, [text, size, margin, fgColor, bgColor, ecLevel, generate]);

  useEffect(() => { generate(); }, []);

  const download = (format) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qrcode.${format}`;
    if (format === 'svg') {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('href', canvas.toDataURL('image/png'));
      img.setAttribute('width', canvas.width);
      img.setAttribute('height', canvas.height);
      svg.appendChild(img);
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
    } else {
      link.href = canvas.toDataURL('image/png');
    }
    link.click();
  };

  const copyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const setPreset = (type) => {
    setShowOptions(false);
    if (type === 'URL') setText('https://');
    else if (type === 'Text') setText('Hello, World!');
    else if (type === 'Phone') setText('tel:+1234567890');
    else if (type === 'SMS') setText('SMSTO:+1234567890:Hello');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">▦</span>
        <h1 className="font-heading text-2xl font-bold text-text">QR Code Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-3">
              <label className="text-xs text-text-tertiary block">Content</label>
              <div className="flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => setPreset(p.label)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-surface text-text-secondary border border-border/50 hover:border-primary/40 hover:text-text transition-all cursor-pointer">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <button onClick={() => setShowOptions(!showOptions)}
                className="flex items-center justify-between w-full text-xs text-text-secondary hover:text-text transition-colors cursor-pointer">
                <span>Options</span>
                <span className={`transition-transform ${showOptions ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {showOptions && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-tertiary mb-1 block">Foreground</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent" />
                        <input value={fgColor} onChange={e => setFgColor(e.target.value)}
                          className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-text-tertiary mb-1 block">Background</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent" />
                        <input value={bgColor} onChange={e => setBgColor(e.target.value)}
                          className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-tertiary mb-1 block">Error Correction</label>
                    <div className="flex gap-1.5">
                      {ecLevels.map((l) => (
                        <button key={l.value} onClick={() => setEcLevel(l.value)}
                          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                            ecLevel === l.value ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border/50 hover:border-primary/40'
                          }`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-tertiary mb-1 block">Size: {size}px</label>
                    <input type="range" min={128} max={600} step={1} value={size} onChange={e => setSize(parseInt(e.target.value))}
                      className="w-full accent-primary cursor-pointer" />
                  </div>

                  <div>
                    <label className="text-xs text-text-tertiary mb-1 block">Margin: {margin}</label>
                    <input type="range" min={0} max={10} step={1} value={margin} onChange={e => setMargin(parseInt(e.target.value))}
                      className="w-full accent-primary cursor-pointer" />
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 flex flex-col items-center gap-3">
              <div className="relative" style={{ width: size, height: size, maxWidth: '100%' }}>
                <canvas ref={canvasRef}
                  className="rounded-xl"
                  style={{ width: '100%', height: 'auto', aspectRatio: '1' }} />
              </div>

              {text.trim() && (
                <div className="flex flex-wrap justify-center gap-2 w-full">
                  <button onClick={() => download('png')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                    Download PNG
                  </button>
                  <button onClick={() => download('svg')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer">
                    Download SVG
                  </button>
                  <button onClick={copyImage}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer">
                    {copied ? 'Copied!' : 'Copy Image'}
                  </button>
                  <CopyButton text={text.trim()} />
                </div>
              )}

              {error && <p className="text-cat-text text-xs">{error}</p>}
            </div>
          </GlassCard>

          {qrInfo && text.trim() && (
            <GlassCard>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-surface rounded-lg px-2 py-2 border border-border/50">
                    <div className="text-xs font-bold text-text">{qrInfo.ec}</div>
                    <div className="text-[10px] text-text-tertiary">EC Level</div>
                  </div>
                  <div className="bg-surface rounded-lg px-2 py-2 border border-border/50">
                    <div className="text-xs font-bold text-text">{size}×{size}</div>
                    <div className="text-[10px] text-text-tertiary">Output</div>
                  </div>
                  <div className="bg-surface rounded-lg px-2 py-2 border border-border/50">
                    <div className="text-xs font-bold text-text">{text.length}</div>
                    <div className="text-[10px] text-text-tertiary">Chars</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
