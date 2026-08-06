'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function TimestampPage() {
  const { addEntry } = useHistory();
  const [tsInput, setTsInput] = useState('');
  const [tsResult, setTsResult] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [dateResult, setDateResult] = useState('');
  const [tsError, setTsError] = useState('');
  const [dateError, setDateError] = useState('');

  const convertTs = useCallback(() => {
    setTsError('');
    const val = parseInt(tsInput);
    if (isNaN(val)) { setTsError('Enter a valid number.'); setTsResult(''); return; }
    const d = new Date(val * 1000);
    if (d.getTime() !== d.getTime()) { setTsError('Invalid timestamp.'); setTsResult(''); return; }
    setTsResult(d.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }));
    addEntry('Timestamp Converter');
  }, [tsInput, addEntry]);

  const convertDate = useCallback(() => {
    setDateError('');
    if (!dateInput.trim()) { setDateError('Enter a date.'); setDateResult(''); return; }
    const d = new Date(dateInput);
    if (d.getTime() !== d.getTime()) { setDateError('Invalid date format.'); setDateResult(''); return; }
    setDateResult(Math.floor(d.getTime() / 1000).toString());
    addEntry('Timestamp Converter');
  }, [dateInput, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⏱</span>
        <h1 className="font-heading text-2xl font-bold text-text">Timestamp Converter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Unix Timestamp → Date</label>
            <div className="flex gap-2 mb-3">
              <input value={tsInput} onChange={(e) => setTsInput(e.target.value)} placeholder="e.g. 1710000000"
                className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              <button onClick={convertTs} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
            </div>
            {tsResult && (
              <div className="bg-surface rounded-lg px-3 py-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text">{tsResult}</span>
                  <CopyButton text={tsResult} />
                </div>
              </div>
            )}
            {tsError && <p className="text-cat-text text-xs mt-2">{tsError}</p>}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Date → Unix Timestamp</label>
            <div className="flex gap-2 mb-3">
              <input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
                className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              <button onClick={convertDate} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
            </div>
            {dateResult && (
              <div className="bg-surface rounded-lg px-3 py-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-text">{dateResult}</span>
                  <CopyButton text={dateResult} />
                </div>
              </div>
            )}
            {dateError && <p className="text-cat-text text-xs mt-2">{dateError}</p>}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
