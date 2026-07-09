'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const CURSORS = [
  { value: 'auto', desc: 'Browser default cursor' },
  { value: 'default', desc: 'Platform default arrow' },
  { value: 'none', desc: 'No cursor is rendered' },
  { value: 'pointer', desc: 'Link or clickable element' },
  { value: 'grab', desc: 'Draggable element (idle)' },
  { value: 'grabbing', desc: 'Draggable element (active)' },
  { value: 'crosshair', desc: 'Precise selection' },
  { value: 'text', desc: 'Text selection' },
  { value: 'vertical-text', desc: 'Vertical text selection' },
  { value: 'move', desc: 'Movable element' },
  { value: 'not-allowed', desc: 'Action not allowed' },
  { value: 'wait', desc: 'Busy / loading' },
  { value: 'progress', desc: 'Background busy' },
  { value: 'help', desc: 'Help available' },
  { value: 'context-menu', desc: 'Context menu available' },
  { value: 'cell', desc: 'Table cell selection' },
  { value: 'copy', desc: 'Copy action' },
  { value: 'alias', desc: 'Create alias/shortcut' },
  { value: 'no-drop', desc: 'Cannot drop here' },
  { value: 'all-scroll', desc: 'Scroll in all directions' },
  { value: 'col-resize', desc: 'Column resize' },
  { value: 'row-resize', desc: 'Row resize' },
  { value: 'n-resize', desc: 'North edge resize' },
  { value: 's-resize', desc: 'South edge resize' },
  { value: 'e-resize', desc: 'East edge resize' },
  { value: 'w-resize', desc: 'West edge resize' },
  { value: 'ne-resize', desc: 'North-east resize' },
  { value: 'nw-resize', desc: 'North-west resize' },
  { value: 'se-resize', desc: 'South-east resize' },
  { value: 'sw-resize', desc: 'South-west resize' },
  { value: 'ew-resize', desc: 'East-west resize' },
  { value: 'ns-resize', desc: 'North-south resize' },
  { value: 'nesw-resize', desc: 'NE-SW resize' },
  { value: 'nwse-resize', desc: 'NW-SE resize' },
  { value: 'zoom-in', desc: 'Zoom in' },
  { value: 'zoom-out', desc: 'Zoom out' },
];

export default function CursorsPage() {
  const { addEntry } = useHistory();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('auto');

  const filtered = CURSORS.filter((c) =>
    c.value.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val) => {
    setSelected(val);
    addEntry('CSS Cursor Reference');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">✙</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Cursor Reference</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cursors..."
                className="w-full bg-surface rounded-lg pl-9 pr-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">~</span>
            </div>
            <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center" style={{ cursor: selected }}>
              <span className="text-xs text-text-tertiary">preview</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map((c) => (
              <button key={c.value} onClick={() => handleSelect(c.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all cursor-pointer ${
                  selected === c.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface hover:border-primary/30'
                }`}
                style={{ cursor: c.value }}>
                <span className="w-8 h-8 rounded-lg bg-surface-dark border border-border/50 flex items-center justify-center text-xs" style={{ cursor: c.value }}>
                  ~
                </span>
                <span className={`text-[11px] font-mono font-medium truncate w-full text-center ${
                  selected === c.value ? 'text-primary' : 'text-text'
                }`}>{c.value}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-text-tertiary text-sm py-8">No cursors found</p>
          )}
        </div>
      </GlassCard>

      {selected && (
        <GlassCard>
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-mono font-medium text-text">cursor: {selected};</span>
              <p className="text-xs text-text-tertiary mt-0.5">{CURSORS.find((c) => c.value === selected)?.desc}</p>
            </div>
            <CopyButton text={`cursor: ${selected};`} />
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
