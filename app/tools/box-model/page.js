'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function cssBoxValue(v) {
  const t = parseFloat(v.top);
  const r = parseFloat(v.right);
  const b = parseFloat(v.bottom);
  const l = parseFloat(v.left);
  if (isNaN(t) || isNaN(r) || isNaN(b) || isNaN(l)) return '';
  if (t === r && t === b && t === l) return `${t}px`;
  if (t === b && r === l) return `${t}px ${r}px`;
  return `${t}px ${r}px ${b}px ${l}px`;
}

export default function BoxModelPage() {
  const { addEntry } = useHistory();
  const [margin, setMargin] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [border, setBorder] = useState({ top: 2, right: 2, bottom: 2, left: 2 });
  const [padding, setPadding] = useState({ top: 16, right: 16, bottom: 16, left: 16 });
  const [contentW, setContentW] = useState(200);
  const [contentH, setContentH] = useState(100);
  const [borderColor, setBorderColor] = useState('#cbd5e1');
  const [activeTab, setActiveTab] = useState('margin');
  const [showGuides, setShowGuides] = useState(true);

  const update = (obj, setter, key, val) => {
    const n = parseInt(val) || 0;
    setter({ ...obj, [key]: n });
  };

  const marginCss = cssBoxValue(margin);
  const borderCss = cssBoxValue(border);
  const paddingCss = cssBoxValue(padding);

  const totalW = margin.left + border.left + padding.left + contentW + padding.right + border.right + margin.right;
  const totalH = margin.top + border.top + padding.top + contentH + padding.bottom + border.bottom + margin.bottom;

  // SVG drawing offsets
  let y = 0;
  const mT = margin.top, mR = margin.right, mB = margin.bottom, mL = margin.left;
  const bT = border.top, bR = border.right, bB = border.bottom, bL = border.left;
  const pT = padding.top, pR = padding.right, pB = padding.bottom, pL = padding.left;

  const mArea = { x: 0, y: 0, w: totalW, h: totalH };
  const bArea = { x: mL, y: mT, w: totalW - mL - mR, h: totalH - mT - mB };
  const pArea = { x: mL + bL, y: mT + bT, w: totalW - mL - mR - bL - bR, h: totalH - mT - mB - bT - bB };
  const cArea = { x: mL + bL + pL, y: mT + bT + pT, w: contentW, h: contentH };

  const cx = totalW / 2;
  const cy = totalH / 2;

  const label = (ax, ay, text, color) => (
    <text x={ax} y={ay} textAnchor="middle" fill={color} fontSize="10" fontFamily="monospace" dominantBaseline="middle">{text}</text>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">▢</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Box Model</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4 overflow-x-auto">
            <div className="flex gap-2 mb-2">
              {['margin', 'border', 'padding', 'content'].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                    activeTab === t ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                  }`}>{t}</button>
              ))}
            </div>

            {activeTab !== 'content' && (
              <div className="grid grid-cols-4 gap-2">
                {['top', 'right', 'bottom', 'left'].map((side) => {
                  const obj = activeTab === 'margin' ? margin : activeTab === 'border' ? border : padding;
                  const setter = activeTab === 'margin' ? setMargin : activeTab === 'border' ? setBorder : setPadding;
                  return (
                    <div key={side}>
                      <label className="text-[10px] text-text-tertiary mb-1 block capitalize">{side}</label>
                      <input type="number" value={obj[side]} onChange={(e) => update(obj, setter, side, e.target.value)}
                        className="w-full bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Width (px)</label>
                  <input type="number" value={contentW} onChange={(e) => setContentW(parseInt(e.target.value) || 0)} min={0}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Height (px)</label>
                  <input type="number" value={contentH} onChange={(e) => setContentH(parseInt(e.target.value) || 0)} min={0}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>
            )}

            {activeTab === 'border' && (
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Border Color</label>
                <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border" />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showGuides} onChange={() => setShowGuides(!showGuides)}
                className="w-4 h-4 rounded border-border bg-surface accent-primary" />
              <span className="text-xs text-text-secondary">Show dimension guides</span>
            </label>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <svg viewBox={`-10 -10 ${totalW + 20} ${totalH + 20}`} className="w-full bg-surface rounded-lg border border-border" style={{ maxHeight: 400 }}>
              <rect x={mArea.x} y={mArea.y} width={mArea.w} height={mArea.h} fill="#fef3c7" stroke="#d97706" strokeWidth={1} strokeDasharray="4,2" />
              <rect x={bArea.x} y={bArea.y} width={bArea.w} height={bArea.h} fill="transparent" stroke={borderColor} strokeWidth={Math.max(1, (border.top + border.bottom) / 4)} />
              <rect x={pArea.x} y={pArea.y} width={pArea.w} height={pArea.h} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4,2" />
              <rect x={cArea.x} y={cArea.y} width={cArea.w} height={cArea.h} fill="#bbf7d0" stroke="#22c55e" strokeWidth={1.5} />

              {showGuides && (
                <>
                  {label(cx, mArea.y + 8, `margin: ${marginCss}`, '#d97706')}
                  {label(cx, mArea.h - mB + 8, '', '#d97706')}
                  {label(pArea.x + pArea.w / 2, pArea.y + pArea.h / 2, `padding: ${paddingCss}`, '#3b82f6')}
                  {label(cArea.x + cArea.w / 2, cArea.y + cArea.h / 2, `${contentW} × ${contentH}`, '#22c55e')}
                </>
              )}
            </svg>

            <div className="text-[10px] text-text-secondary text-center font-mono">Total: {totalW} × {totalH} px</div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-5">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-tertiary">Generated CSS</span>
            <CopyButton text={`margin: ${marginCss};\npadding: ${paddingCss};\nborder: ${Math.max(border.top, border.right, border.bottom, border.left)}px solid ${borderColor};\nwidth: ${contentW}px;\nheight: ${contentH}px;`} />
          </div>
          <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap">
{`/* Box Model */
margin: ${marginCss || '0px'};
padding: ${paddingCss || '0px'};
border: ${Math.max(border.top, border.right, border.bottom, border.left)}px solid ${borderColor};
width: ${contentW}px;
height: ${contentH}px;
box-sizing: content-box;`}
          </pre>
        </div>
      </GlassCard>
    </motion.div>
  );
}
