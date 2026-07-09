'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function FlexboxPage() {
  const { addEntry } = useHistory();
  const [direction, setDirection] = useState('row');
  const [wrap, setWrap] = useState('nowrap');
  const [justify, setJustify] = useState('flex-start');
  const [align, setAlign] = useState('stretch');
  const [alignContent, setAlignContent] = useState('stretch');
  const [gap, setGap] = useState(8);
  const [items, setItems] = useState(4);
  const [itemW, setItemW] = useState(60);
  const [itemH, setItemH] = useState(40);
  const [colors, setColors] = useState(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']);

  const css = `.container {
  display: flex;
  flex-direction: ${direction};
  flex-wrap: ${wrap};
  justify-content: ${justify};
  align-items: ${align};
  align-content: ${alignContent};
  gap: ${gap}px;
}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">≡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Flexbox Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="bg-surface rounded-lg border border-border p-4 min-h-[240px] flex items-center justify-center overflow-auto"
                style={{ flexDirection: direction, flexWrap: wrap, justifyContent: justify, alignItems: align, alignContent: alignContent, gap: gap }}>
                {Array.from({ length: items }).map((_, i) => (
                  <div key={i} className="rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono shrink-0"
                    style={{ width: itemW, height: direction.includes('column') ? itemH : itemH, backgroundColor: colors[i % colors.length], minWidth: 20, minHeight: 16 }}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Controls</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">flex-direction</label>
                  <select value={direction} onChange={(e) => setDirection(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-1.5 text-[11px] text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    <option value="row">row</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column">column</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">flex-wrap</label>
                  <select value={wrap} onChange={(e) => setWrap(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-1.5 text-[11px] text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    <option value="nowrap">nowrap</option>
                    <option value="wrap">wrap</option>
                    <option value="wrap-reverse">wrap-reverse</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">justify-content</label>
                  <select value={justify} onChange={(e) => setJustify(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-1.5 text-[11px] text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    {['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">align-items</label>
                  <select value={align} onChange={(e) => setAlign(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-1.5 text-[11px] text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    {['stretch', 'flex-start', 'flex-end', 'center', 'baseline'].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">align-content</label>
                  <select value={alignContent} onChange={(e) => setAlignContent(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-1.5 text-[11px] text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    {['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around'].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">gap: {gap}px</label>
                  <input type="range" min={0} max={40} value={gap} onChange={(e) => setGap(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Items: {items}</label>
                  <input type="range" min={1} max={8} value={items} onChange={(e) => setItems(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Width: {itemW}px</label>
                  <input type="range" min={30} max={200} value={itemW} onChange={(e) => setItemW(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Height: {itemH}px</label>
                  <input type="range" min={20} max={100} value={itemH} onChange={(e) => setItemH(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">CSS</span>
                <CopyButton text={css} />
              </div>
              <pre className="bg-surface rounded-lg p-3 text-[11px] font-mono text-text border border-border whitespace-pre-wrap">{css}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
