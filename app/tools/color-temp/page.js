'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function kelvinToRGB(k) {
  const t = k / 100;
  let r, g, b;
  if (t <= 66) { r = 255; g = Math.round(99.4708025861 * Math.log(t) - 161.1195681661); if (t <= 19) b = 0; else b = Math.round(138.5177312231 * Math.log(t - 10) - 305.0447927307); }
  else { r = Math.round(329.698727446 * Math.pow(t - 60, -0.1332047592)); g = Math.round(288.1221695283 * Math.pow(t - 60, -0.0755148492)); b = 255; }
  const clamp = (v) => Math.max(0, Math.min(255, v));
  r = clamp(r); g = clamp(g); b = clamp(b);
  const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return { r, g, b, hex };
}

function rgbToKelvin(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, v));
  r = clamp(r); g = clamp(g); b = clamp(b);
  const eps = 0.0001;
  const rEff = r / 255, gEff = g / 255, bEff = b / 255;
  const X = (-0.14282 * rEff + 1.54924 * gEff - 0.95641 * bEff) / (0.41847 * rEff - 0.85266 * gEff + 1.52432 * bEff + eps);
  const Y = (0.63612 * rEff + 1.37369 * gEff + 0.06939 * bEff) / (0.41847 * rEff - 0.85266 * gEff + 1.52432 * bEff + eps);
  const n = (X / (Y + eps) - 0.332) / (0.1858 - (X / (Y + eps)) / 1.2915);
  const cct = 449 * Math.pow(n, 3) + 3525 * Math.pow(n, 2) + 6823.3 * n + 5520.33;
  return Math.round(Math.max(1000, Math.min(40000, cct)));
}

const presets = [
  { name: 'Candle', k: 1850 },
  { name: 'Tungsten', k: 2700 },
  { name: 'Halogen', k: 3000 },
  { name: 'Sunrise/Sunset', k: 3200 },
  { name: 'Daylight', k: 5500 },
  { name: 'Noon Sun', k: 6500 },
  { name: 'Overcast', k: 7500 },
  { name: 'Shade', k: 8000 },
  { name: 'Blue Sky', k: 10000 },
  { name: 'Clear Sky', k: 15000 },
];

export default function ColorTempPage() {
  const { addEntry } = useHistory();
  const [kelvin, setKelvin] = useState(5500);
  const [swatches, setSwatches] = useState([]);
  const [reverse, setReverse] = useState({ r: 255, g: 255, b: 255 });
  const [reverseHex, setReverseHex] = useState('#ffffff');
  const rgb = kelvinToRGB(kelvin);

  const saveSwatch = useCallback(() => {
    setSwatches((prev) => [rgb.hex, ...prev.filter((s) => s !== rgb.hex)].slice(0, 12));
    addEntry('Color Temperature');
  }, [rgb, addEntry]);

  const applyReverse = useCallback((hex) => {
    setReverseHex(hex);
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
      setReverse({ r, g, b });
      setKelvin(rgbToKelvin(r, g, b));
    }
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Color Temperature</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="bg-surface rounded-xl border border-border p-8 flex items-center justify-center min-h-[200px] transition-colors duration-300" style={{ backgroundColor: rgb.hex }}>
              <div className="text-center drop-shadow-lg">
                <div className="text-lg font-mono font-bold" style={{ color: kelvin < 4000 ? '#fff' : '#1e293b' }}>{kelvin}K</div>
                <div className="text-xs font-mono mt-1" style={{ color: kelvin < 4000 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}>{rgb.hex}</div>
              </div>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Temperature: {kelvin}K</label>
              <input type="range" min={1000} max={40000} step={100} value={kelvin} onChange={(e) => setKelvin(parseInt(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-text-secondary"><span>1000K (Warm)</span><span>40000K (Cool)</span></div>
            </div>

            <div>
              <span className="text-xs text-text-tertiary mb-2 block">Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button key={p.name} onClick={() => setKelvin(p.k)}
                    className={`text-[10px] px-2 py-1 rounded transition-all cursor-pointer ${
                      kelvin === p.k ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:text-text'
                    }`}>{p.name} {p.k}K</button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary">RGB Values</span>
            <div className="space-y-3">
              {[
                { label: 'Red', val: rgb.r, color: 'bg-red-500' },
                { label: 'Green', val: rgb.g, color: 'bg-green-500' },
                { label: 'Blue', val: rgb.b, color: 'bg-blue-500' },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-tertiary">{label}</span>
                    <span className="font-mono text-text">{val}</span>
                  </div>
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(val / 255) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Hex</span>
                <CopyButton text={rgb.hex} />
              </div>
              <div className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border">{rgb.hex}</div>
            </div>

            <div className="border-t border-border pt-4">
              <span className="text-xs text-text-tertiary mb-2 block">CSS</span>
              <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap">{`color: ${rgb.hex};
background-color: ${rgb.hex};`}</pre>
            </div>

            <button onClick={saveSwatch} className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">Save to Palette</button>
            {swatches.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {swatches.map((s, i) => (
                  <button key={i} onClick={() => setKelvin(rgbToKelvin(parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)))}
                    className="w-6 h-6 rounded border border-border cursor-pointer" style={{ backgroundColor: s }} title={s} />
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-5">
        <div className="p-4 space-y-3">
          <span className="text-xs text-text-tertiary block">Reverse: RGB / Hex → Kelvin</span>
          <div className="flex items-center gap-3">
            <input type="color" value={reverseHex} onChange={(e) => applyReverse(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
            <input type="text" value={reverseHex} onChange={(e) => applyReverse(e.target.value)}
              className="w-28 bg-surface text-text rounded-lg border border-border px-3 py-2 text-sm font-mono outline-none focus:border-primary/50" />
            <span className="text-sm text-text-tertiary">≈ <span className="text-text font-mono font-semibold">{rgbToKelvin(reverse.r, reverse.g, reverse.b)}K</span></span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
