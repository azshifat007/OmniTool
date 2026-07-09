'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function caesar(text, shift, decode) {
  const s = decode ? -shift : shift;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + s % 26 + 26) % 26) + base);
  });
}

function atbash(text) {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(25 - (c.charCodeAt(0) - base) + base);
  });
}

function rot13(text) { return caesar(text, 13, false); }

function vigenere(text, key, decode) {
  if (!key) return text;
  const dir = decode ? -1 : 1;
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = key[ki % key.length].toLowerCase().charCodeAt(0) - 97;
    ki++;
    return String.fromCharCode(((c.charCodeAt(0) - base + dir * shift + 26) % 26) + base);
  });
}

const ciphers = ['Caesar', 'Atbash', 'ROT13', 'Vigenere'];

export default function CiphersPage() {
  const { addEntry } = useHistory();
  const [cipher, setCipher] = useState('Caesar');
  const [input, setInput] = useState('');
  const [shift, setShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState('key');
  const [mode, setMode] = useState('encode');

  const output = useMemo(() => {
    const isDecode = mode === 'decode';
    switch (cipher) {
      case 'Caesar': return caesar(input, shift, isDecode);
      case 'Atbash': return atbash(input);
      case 'ROT13': return rot13(input);
      case 'Vigenere': return vigenere(input, vigenereKey, isDecode);
      default: return input;
    }
  }, [cipher, input, shift, vigenereKey, mode]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚔</span>
        <h1 className="font-heading text-2xl font-bold text-text">Ciphers</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {ciphers.map((c) => (
                <button key={c} onClick={() => setCipher(c)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    cipher === c ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                  }`}>{c}</button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setMode('encode')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${mode === 'encode' ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>Encode</button>
              <button onClick={() => setMode('decode')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${mode === 'decode' ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>Decode</button>
            </div>

            {cipher === 'Caesar' && (
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Shift: {shift}</label>
                <input type="range" min={1} max={25} value={shift} onChange={(e) => setShift(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
            )}

            {cipher === 'Vigenere' && (
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Key</label>
                <input value={vigenereKey} onChange={(e) => setVigenereKey(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            )}

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Input</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} placeholder="Enter text..."
                className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ['Hello World', 'HELLO WORLD'],
                ['The quick brown fox', 'THE QUICK BROWN FOX'],
                ['Secret message', 'SECRET MESSAGE'],
              ].map(([label, val]) => (
                <button key={label} onClick={() => setInput(val)}
                  className="text-[10px] px-2 py-1 rounded bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">{label}</button>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Output</span>
                <CopyButton text={output} />
              </div>
              <div className="bg-surface rounded-lg p-3 text-sm font-mono text-text border border-border min-h-[120px] break-all">{output || <span className="text-text-tertiary text-xs">Enter text to {mode}</span>}</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">About {cipher}</span>
              <div className="text-[11px] text-text-secondary leading-relaxed">
                {cipher === 'Caesar' && 'Each letter is shifted by a fixed number of positions in the alphabet. Named after Julius Caesar who used it with a shift of 3.'}
                {cipher === 'Atbash' && 'Each letter is replaced with its reverse in the alphabet (A→Z, B→Y, etc.). Originally used for Hebrew alphabet.'}
                {cipher === 'ROT13' && 'A special case of Caesar cipher with a shift of 13. Often used to obscure text on the internet.'}
                {cipher === 'Vigenere' && 'Uses a keyword to shift letters by varying amounts. Each letter of the key determines the shift for the corresponding plaintext letter.'}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
