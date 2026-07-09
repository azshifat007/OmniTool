'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

let layerId = 0;

function newLayer() {
  layerId++;
  return { id: layerId, x: 2, y: 2, blur: 4, color: '#00000033' };
}

function shadowCss(layers) {
  return layers.map((l) => `${l.x}px ${l.y}px ${l.blur}px ${l.color}`).join(', ');
}

export default function TextShadowPage() {
  const { addEntry } = useHistory();
  const [layers, setLayers] = useState([{ id: 0, x: 2, y: 2, blur: 4, color: '#00000033' }]);
  const [text, setText] = useState('Hello World');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#1e293b');
  const [bgColor, setBgColor] = useState('#ffffff');

  const addLayer = () => setLayers([...layers, newLayer()]);
  const removeLayer = (id) => { if (layers.length > 1) setLayers(layers.filter((l) => l.id !== id)); };
  const updateLayer = (id, key, val) => {
    setLayers(layers.map((l) => l.id === id ? { ...l, [key]: val } : l));
  };

  const css = shadowCss(layers);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">T</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text Shadow Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 space-y-3">
              <span className="text-xs text-text-tertiary">Text Settings</span>
              <input value={text} onChange={(e) => setText(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Font size</label>
                  <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 16)} min={8} max={200}
                    className="w-full bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Text color</label>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-border" />
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Background</label>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-border" />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Shadow Layers</span>
                <button onClick={addLayer} className="text-[10px] text-primary hover:underline cursor-pointer">+ Add layer</button>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {layers.map((l, i) => (
                  <div key={l.id} className="bg-surface rounded-lg p-3 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-text-tertiary font-mono">Layer {i + 1}</span>
                      {layers.length > 1 && (
                        <button onClick={() => removeLayer(l.id)} className="text-[10px] text-cat-text hover:underline cursor-pointer">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: 'x', label: 'X' },
                        { key: 'y', label: 'Y' },
                        { key: 'blur', label: 'Blur' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-[9px] text-text-tertiary">{label}</label>
                          <input type="number" value={l[key]} onChange={(e) => updateLayer(l.id, key, parseInt(e.target.value) || 0)}
                            className="w-full bg-badge-bg rounded px-2 py-1 text-[10px] font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                        </div>
                      ))}
                      <div>
                        <label className="text-[9px] text-text-tertiary">Color</label>
                        <input type="color" value={l.color} onChange={(e) => updateLayer(l.id, 'color', e.target.value)}
                          className="w-full h-[26px] rounded cursor-pointer border border-border" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Preview</span>
              <div className="rounded-lg border border-border overflow-hidden" style={{ background: bgColor }}>
                <div className="flex items-center justify-center p-8 min-h-[200px]">
                  <div style={{
                    fontSize: `${fontSize}px`,
                    color: textColor,
                    fontWeight: 800,
                    fontFamily: 'sans-serif',
                    textShadow: css || 'none',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}>{text || 'Preview'}</div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">CSS</span>
                <CopyButton text={`text-shadow: ${css};`} />
              </div>
              <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap">{`text-shadow: ${css};`}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
