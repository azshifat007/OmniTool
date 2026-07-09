'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function ScrollbarPage() {
  const { addEntry } = useHistory();
  const [width, setWidth] = useState(8);
  const [trackColor, setTrackColor] = useState('#f1f1f1');
  const [thumbColor, setThumbColor] = useState('#888');
  const [thumbHover, setThumbHover] = useState('#555');
  const [borderRadius, setBorderRadius] = useState(4);

  const css = useMemo(() => {
    return `/* Scrollbar styles for WebKit browsers */
::-webkit-scrollbar {
  width: ${width}px;
}

::-webkit-scrollbar-track {
  background: ${trackColor};
  border-radius: ${borderRadius}px;
}

::-webkit-scrollbar-thumb {
  background: ${thumbColor};
  border-radius: ${borderRadius}px;
}

::-webkit-scrollbar-thumb:hover {
  background: ${thumbHover};
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: ${thumbColor} ${trackColor};
}`;
  }, [width, trackColor, thumbColor, thumbHover, borderRadius]);

  const handleCopy = () => {
    addEntry('Scrollbar CSS Generator');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">▤</span>
        <h1 className="font-heading text-2xl font-bold text-text">Scrollbar CSS Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Width: {width}px</label>
              <input type="range" min={4} max={20} value={width} onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Border Radius: {borderRadius}px</label>
              <input type="range" min={0} max={12} value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Track Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={trackColor} onChange={(e) => setTrackColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border" />
                <input type="text" value={trackColor} onChange={(e) => setTrackColor(e.target.value)}
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Thumb Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={thumbColor} onChange={(e) => setThumbColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border" />
                <input type="text" value={thumbColor} onChange={(e) => setThumbColor(e.target.value)}
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Thumb Hover Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={thumbHover} onChange={(e) => setThumbHover(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border" />
                <input type="text" value={thumbHover} onChange={(e) => setThumbHover(e.target.value)}
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 max-h-40 overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: `${thumbColor} ${trackColor}`,
            }}>
              <p className="text-xs text-text-secondary leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-text-tertiary">CSS Code</label>
              <div onClick={handleCopy}><CopyButton text={css} /></div>
            </div>
            <pre className="bg-surface rounded-lg px-3 py-3 text-xs font-mono text-text border border-border/50 overflow-auto whitespace-pre max-h-[400px]">{css}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
