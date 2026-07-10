'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function MazePage() {
  const { addEntry } = useHistory();
  const [size, setSize] = useState(10);
  const [maze, setMaze] = useState(null);
  const [solved, setSolved] = useState(null);
  const [player, setPlayer] = useState(null);
  const [won, setWon] = useState(false);
  const canvasRef = useRef(null);

  const generateMaze = useCallback((n) => {
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ top: true, right: true, bottom: true, left: true, visited: false })));
    const stack = [[0, 0]];
    grid[0][0].visited = true;
    while (stack.length > 0) {
      const [r, c] = stack[stack.length - 1];
      const neighbors = [];
      if (r > 0 && !grid[r - 1][c].visited) neighbors.push([r - 1, c, 'top', 'bottom']);
      if (r < n - 1 && !grid[r + 1][c].visited) neighbors.push([r + 1, c, 'bottom', 'top']);
      if (c > 0 && !grid[r][c - 1].visited) neighbors.push([r, c - 1, 'left', 'right']);
      if (c < n - 1 && !grid[r][c + 1].visited) neighbors.push([r, c + 1, 'right', 'left']);
      if (neighbors.length === 0) { stack.pop(); continue; }
      const [nr, nc, dir, opp] = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[r][c][dir] = false;
      grid[nr][nc][opp] = false;
      grid[nr][nc].visited = true;
      stack.push([nr, nc]);
    }
    return grid;
  }, []);

  const drawMaze = useCallback((grid, sol, px, py) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const n = grid.length;
    const cell = canvas.width / n;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const x = c * cell, y = r * cell;
        if (grid[r][c].top) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cell, y); ctx.stroke(); }
        if (grid[r][c].right) { ctx.beginPath(); ctx.moveTo(x + cell, y); ctx.lineTo(x + cell, y + cell); ctx.stroke(); }
        if (grid[r][c].bottom) { ctx.beginPath(); ctx.moveTo(x, y + cell); ctx.lineTo(x + cell, y + cell); ctx.stroke(); }
        if (grid[r][c].left) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cell); ctx.stroke(); }
      }
    }
    if (sol) {
      ctx.fillStyle = 'rgba(108, 92, 231, 0.3)';
      for (const [r, c] of sol) {
        ctx.fillRect(c * cell + 2, r * cell + 2, cell - 4, cell - 4);
      }
    }
    if (px !== undefined && py !== undefined) {
      ctx.fillStyle = '#6C5CE7';
      ctx.beginPath();
      ctx.arc(py * cell + cell / 2, px * cell + cell / 2, cell * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc((n - 1) * cell + cell / 2, (n - 1) * cell + cell / 2, cell * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const solveMaze = useCallback((grid) => {
    const n = grid.length;
    const visited = Array.from({ length: n }, () => Array(n).fill(false));
    const parent = {};
    const queue = [[0, 0]];
    visited[0][0] = true;
    while (queue.length > 0) {
      const [r, c] = queue.shift();
      if (r === n - 1 && c === n - 1) break;
      for (const [nr, nc, dir] of [[r - 1, c, 'top'], [r + 1, c, 'bottom'], [r, c - 1, 'left'], [r, c + 1, 'right']]) {
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc] && !grid[r][c][dir]) {
          visited[nr][nc] = true;
          parent[`${nr},${nc}`] = [r, c];
          queue.push([nr, nc]);
        }
      }
    }
    const path = [];
    let cur = [n - 1, n - 1];
    while (cur) {
      path.unshift(cur);
      cur = parent[`${cur[0]},${cur[1]}`];
    }
    return path;
  }, []);

  const handleGenerate = useCallback(() => {
    addEntry('Maze Generator');
    const g = generateMaze(size);
    setMaze(g);
    setSolved(null);
    setPlayer(null);
    setWon(false);
    const sol = solveMaze(g);
    setSolved(sol);
    setTimeout(() => drawMaze(g, sol), 50);
  }, [size, generateMaze, solveMaze, addEntry, drawMaze]);

  const handleSolve = useCallback(() => {
    if (maze && solved) drawMaze(maze, solved);
  }, [maze, solved, drawMaze]);

  useEffect(() => {
    if (!player && maze) drawMaze(maze, solved);
  }, [maze, solved, player, drawMaze]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!maze || won) return;
      let [r, c] = player || [0, 0];
      let nr = r, nc = c;
      if (e.key === 'ArrowUp') nr--;
      else if (e.key === 'ArrowDown') nr++;
      else if (e.key === 'ArrowLeft') nc--;
      else if (e.key === 'ArrowRight') nc++;
      else return;
      e.preventDefault();
      if (nr < 0 || nr >= maze.length || nc < 0 || nc >= maze.length) return;
      const dirs = { '-1,0': 'top', '1,0': 'bottom', '0,-1': 'left', '0,1': 'right' };
      if (!maze[r][c][dirs[`${nr - r},${nc - c}`]]) {
        const np = [nr, nc];
        setPlayer(np);
        drawMaze(maze, solved, nr, nc);
        if (nr === maze.length - 1 && nc === maze.length - 1) setWon(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [maze, solved, player, won, drawMaze]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">◫</span>
        <h1 className="font-heading text-2xl font-bold text-text">Maze Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Size: {size}×{size}</span>
            <input type="range" min={5} max={25} value={size} onChange={e => setSize(Number(e.target.value))}
              className="w-28 accent-primary cursor-pointer" />
          </label>
          <button onClick={handleGenerate}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
            Generate
          </button>
          {maze && (
            <button onClick={handleSolve}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">
              Show Solution
            </button>
          )}
        </div>
      </GlassCard>

      {maze && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
          <GlassCard>
            <div className="p-4 flex flex-col items-center gap-3">
              <canvas ref={canvasRef} width={400} height={400} className="rounded-lg max-w-full" style={{ imageRendering: 'pixelated' }} />
              <div className="flex items-center gap-4 text-xs text-text-tertiary">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary inline-block" /> You</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cat-success inline-block" /> Goal</span>
                <span>Use arrow keys to navigate</span>
              </div>
              {won && <div className="text-sm font-semibold text-cat-success animate-fade-up">You reached the goal!</div>}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
