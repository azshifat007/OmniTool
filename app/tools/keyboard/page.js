'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const rows = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl'],
];

const keyWidths = {
  Esc: 50, Backspace: 90, Tab: 65, Caps: 75, Enter: 85, Shift: 95, Space: 260, Ctrl: 60, Alt: 60,
};

const keyMap = {
  Escape: 'Esc', F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
  Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0', Minus: '-', Equal: '=', Backspace: 'Backspace',
  Tab: 'Tab', KeyQ: 'Q', KeyW: 'W', KeyE: 'E', KeyR: 'R', KeyT: 'T', KeyY: 'Y', KeyU: 'U', KeyI: 'I', KeyO: 'O', KeyP: 'P', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  CapsLock: 'Caps', KeyA: 'A', KeyS: 'S', KeyD: 'D', KeyF: 'F', KeyG: 'G', KeyH: 'H', KeyJ: 'J', KeyK: 'K', KeyL: 'L', Semicolon: ';', Quote: "'", Enter: 'Enter',
  ShiftLeft: 'Shift', KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B', KeyN: 'N', KeyM: 'M', Comma: ',', Period: '.', Slash: '/', ShiftRight: 'Shift',
  ControlLeft: 'Ctrl', AltLeft: 'Alt', Space: 'Space', AltRight: 'Alt', ControlRight: 'Ctrl',
};

export default function KeyboardPage() {
  const { addEntry } = useHistory();
  const [pressed, setPressed] = useState({});
  const [log, setLog] = useState([]);
  const [listening, setListening] = useState(true);

  const handleDown = useCallback((e) => {
    e.preventDefault();
    const key = keyMap[e.code];
    if (key) {
      setPressed((p) => ({ ...p, [key]: true }));
      setLog((l) => [{ key, code: e.code, time: new Date().toLocaleTimeString() }, ...l].slice(0, 50));
    }
  }, []);

  const handleUp = useCallback((e) => {
    const key = keyMap[e.code];
    if (key) setPressed((p) => ({ ...p, [key]: false }));
  }, []);

  useEffect(() => {
    if (!listening) return;
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    addEntry('Keyboard Tester');
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [listening, handleDown, handleUp, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">⌨</span>
        <h1 className="font-heading text-2xl font-bold text-text">Keyboard Tester</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-text-tertiary">Press any key</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={listening} onChange={() => setListening(!listening)}
                    className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                  <span className="text-[10px] text-text-secondary">{listening ? 'Listening' : 'Paused'}</span>
                </label>
              </div>
              <div className="space-y-1">
                {rows.map((row, ri) => (
                  <div key={ri} className="flex gap-1 justify-center">
                    {row.map((key) => {
                      const w = keyWidths[key] || 46;
                      const isPressed = pressed[key];
                      return (
                        <div key={key} className={`flex items-center justify-center rounded text-[9px] font-mono font-semibold transition-all duration-75 ${
                          isPressed ? 'bg-primary text-white scale-95 shadow-md' : 'bg-surface text-text-secondary border border-border'
                        }`} style={{ width: w, height: 40 }}>
                          {key}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Key Log</span>
                <button onClick={() => setLog([])} className="text-[10px] text-primary hover:underline cursor-pointer">Clear</button>
              </div>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {log.length === 0 && <div className="text-[10px] text-text-tertiary text-center py-4">No keys pressed</div>}
                {log.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface rounded px-2 py-1 border border-border text-[10px] font-mono">
                    <span className="text-text font-semibold">{entry.key}</span>
                    <span className="text-text-tertiary">{entry.code}</span>
                    <span className="text-text-secondary">{entry.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
