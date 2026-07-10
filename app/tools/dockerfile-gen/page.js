'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const PRESETS = [
  { label: 'Node.js', dockerfile: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]` },
  { label: 'Python', dockerfile: `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]` },
  { label: 'Go', dockerfile: `FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o app .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/app .
EXPOSE 8080
CMD ["./app"]` },
  { label: 'Nginx', dockerfile: `FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY html/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]` },
  { label: 'Static HTML', dockerfile: `FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]` },
  { label: 'Python Flask', dockerfile: `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]` },
];

export default function DockerfileGenPage() {
  const { addEntry } = useHistory();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [custom, setCustom] = useState(PRESETS[0].dockerfile);

  const selectPreset = useCallback((p) => {
    setPreset(p);
    setCustom(p.dockerfile);
    addEntry('Dockerfile Generator');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">⎈</span>
        <h1 className="font-heading text-2xl font-bold text-text">Dockerfile Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <p className="text-xs text-text-secondary">Generate Dockerfiles from preset templates.</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => selectPreset(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${preset.label === p.label ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:text-text'}`}>{p.label}</button>
              ))}
            </div>
            <p className="text-xs text-text-tertiary pt-2">Edit the Dockerfile below as needed.</p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Dockerfile</span>
              <CopyButton text={custom} className="text-xs" />
            </div>
            <textarea value={custom} onChange={(e) => setCustom(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
