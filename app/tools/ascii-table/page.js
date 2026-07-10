'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const asciiRows = Array.from({ length: 128 }, (_, i) => {
  const char = i <= 32
    ? ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'TAB', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI',
       'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US', ' '][i]
    : i === 127 ? 'DEL' : String.fromCharCode(i);
  return {
    dec: i,
    hex: i.toString(16).toUpperCase().padStart(2, '0'),
    bin: i.toString(2).padStart(8, '0'),
    oct: i.toString(8).padStart(3, '0'),
    char,
    html: i === 32 ? '&nbsp;' : i === 34 ? '&quot;' : i === 38 ? '&amp;' : i === 60 ? '&lt;' : i === 62 ? '&gt;' : char,
    desc: i <= 32 ? ['null', 'start of heading', 'start of text', 'end of text', 'end of transmission', 'enquiry', 'acknowledge', 'bell', 'backspace', 'tab', 'line feed', 'vertical tab', 'form feed', 'carriage return', 'shift out', 'shift in',
      'data link escape', 'device control 1', 'device control 2', 'device control 3', 'device control 4', 'negative ack', 'synchronous idle', 'end of trans. block', 'cancel', 'end of medium', 'substitute', 'escape', 'file separator', 'group separator', 'record separator', 'unit separator', 'space'][i]
      : i === 127 ? 'delete' : 'printable',
  };
});

const groups = [
  { label: 'Control (0-31)', start: 0, end: 31, color: 'text-cat-text' },
  { label: 'Punctuation & Digits (32-47)', start: 32, end: 47, color: 'text-cat-code' },
  { label: 'Digits (48-57)', start: 48, end: 57, color: 'text-cat-math' },
  { label: 'Punctuation (58-64)', start: 58, end: 64, color: 'text-cat-code' },
  { label: 'Uppercase (65-90)', start: 65, end: 90, color: 'text-cat-security' },
  { label: 'Punctuation (91-96)', start: 91, end: 96, color: 'text-cat-code' },
  { label: 'Lowercase (97-122)', start: 97, end: 122, color: 'text-cat-design' },
  { label: 'Punctuation (123-126)', start: 123, end: 126, color: 'text-cat-code' },
  { label: 'Delete (127)', start: 127, end: 127, color: 'text-cat-text' },
];

export default function AsciiTablePage() {
  const { addEntry } = useHistory();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return asciiRows;
    const q = search.toLowerCase();
    return asciiRows.filter(r =>
      r.dec.toString().includes(q) ||
      r.hex.toLowerCase().includes(q) ||
      r.bin.includes(q) ||
      (typeof r.char === 'string' && r.char.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">00</span>
        <h1 className="font-heading text-2xl font-bold text-text">ASCII Table</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Search by dec, hex, binary, or character</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. 65, 4A, 01000001, A"
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
        </div>
      </GlassCard>

      <div className="mt-5 space-y-5">
        {groups.map(group => {
          const rows = filtered.filter(r => r.dec >= group.start && r.dec <= group.end);
          if (rows.length === 0) return null;
          return (
            <GlassCard key={group.label}>
              <div className="p-4">
                <div className={`text-xs font-bold mb-3 ${group.color}`}>{group.label}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-text-tertiary border-b border-border">
                        <th className="text-left py-1.5 pr-2">Dec</th>
                        <th className="text-left py-1.5 pr-2">Hex</th>
                        <th className="text-left py-1.5 pr-2">Oct</th>
                        <th className="text-left py-1.5 pr-2">Bin</th>
                        <th className="text-left py-1.5 pr-2">Char</th>
                        <th className="text-left py-1.5">HTML</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(r => (
                        <tr key={r.dec} onClick={() => { navigator.clipboard.writeText(r.char); addEntry('ASCII Table'); }}
                          className="border-b border-border/30 last:border-0 hover:bg-surface/50 cursor-pointer transition-colors">
                          <td className="py-1 pr-2 text-text">{r.dec}</td>
                          <td className="py-1 pr-2 text-text-secondary">{r.hex}</td>
                          <td className="py-1 pr-2 text-text-tertiary">{r.oct}</td>
                          <td className="py-1 pr-2 text-text-tertiary">{r.bin}</td>
                          <td className={`py-1 pr-2 ${r.dec < 33 || r.dec === 127 ? 'text-text-tertiary italic' : 'text-text font-bold'}`}>{r.char}</td>
                          <td className="py-1 text-text-tertiary">{r.html}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </motion.div>
  );
}
