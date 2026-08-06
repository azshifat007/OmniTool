'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getHistory, addHistory as addHistoryLib, clearHistory as clearHistoryLib } from '@/lib/history';

const HistoryContext = createContext(null);

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}

export default function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const addEntry = useCallback((name) => {
    addHistoryLib(name);
    setHistory(getHistory());
  }, []);

  const clear = useCallback(() => {
    clearHistoryLib();
    setHistory([]);
  }, []);

  return (
    <HistoryContext.Provider value={{ history, addEntry, clear }}>
      {children}
    </HistoryContext.Provider>
  );
}
