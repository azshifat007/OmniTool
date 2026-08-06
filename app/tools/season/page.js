'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import CopyButton from '@/components/CopyButton'
import { useHistory } from '@/components/HistoryProvider'

const SEASONS = {
  north: {
    Spring: { emoji: '🌸', months: [2, 3, 4], start: 'Mar 20', end: 'Jun 20', desc: 'Flowers bloom, allergies peak, days lengthen' },
    Summer: { emoji: '☀️', months: [5, 6, 7], start: 'Jun 21', end: 'Sep 22', desc: 'Longest days, peak heat, vacation season' },
    Autumn: { emoji: '🍂', months: [8, 9, 10], start: 'Sep 23', end: 'Dec 20', desc: 'Leaves fall, cooler air, harvest time' },
    Winter: { emoji: '❄️', months: [11, 0, 1], start: 'Dec 21', end: 'Mar 19', desc: 'Shortest days, coldest air, cozy indoors' },
  },
  south: {
    Spring: { emoji: '🌸', months: [8, 9, 10], start: 'Sep 23', end: 'Dec 20', desc: 'Flowers bloom, allergies peak, days lengthen' },
    Summer: { emoji: '☀️', months: [11, 0, 1], start: 'Dec 21', end: 'Mar 19', desc: 'Longest days, peak heat, vacation season' },
    Autumn: { emoji: '🍂', months: [2, 3, 4], start: 'Mar 20', end: 'Jun 20', desc: 'Leaves fall, cooler air, harvest time' },
    Winter: { emoji: '❄️', months: [5, 6, 7], start: 'Jun 21', end: 'Sep 22', desc: 'Shortest days, coldest air, cozy indoors' },
  }
}

const SEASON_COLORS = {
  Spring: ['bg-green-100', 'bg-green-200', 'bg-green-300'],
  Summer: ['bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300'],
  Autumn: ['bg-orange-100', 'bg-orange-200', 'bg-orange-300'],
  Winter: ['bg-blue-100', 'bg-blue-200', 'bg-blue-300'],
}

function getSeason(date, hemisphere) {
  const m = date.getMonth()
  const d = date.getDate()
  const seasons = SEASONS[hemisphere]

  const astro = (() => {
    if (hemisphere === 'north') {
      if ((m === 11 && d >= 21) || m <= 1 || (m === 2 && d < 20)) return 'Winter'
      if ((m === 2 && d >= 20) || m <= 4 || (m === 5 && d < 21)) return 'Spring'
      if ((m === 5 && d >= 21) || m <= 7 || (m === 8 && d < 22)) return 'Summer'
      return 'Autumn'
    } else {
      if ((m === 11 && d >= 21) || m <= 1 || (m === 2 && d < 20)) return 'Summer'
      if ((m === 2 && d >= 20) || m <= 4 || (m === 5 && d < 21)) return 'Autumn'
      if ((m === 5 && d >= 21) || m <= 7 || (m === 8 && d < 22)) return 'Winter'
      return 'Spring'
    }
  })()

  const meteo = (() => {
    if (hemisphere === 'north') {
      if (m >= 2 && m <= 4) return 'Spring'
      if (m >= 5 && m <= 7) return 'Summer'
      if (m >= 8 && m <= 10) return 'Autumn'
      return 'Winter'
    } else {
      if (m >= 2 && m <= 4) return 'Autumn'
      if (m >= 5 && m <= 7) return 'Winter'
      if (m >= 8 && m <= 10) return 'Spring'
      return 'Summer'
    }
  })()

  return { astro, meteo }
}

function getDaysUntilNextSeason(date, hemisphere) {
  const now = new Date(date)
  const seasons = SEASONS[hemisphere]
  const seasonOrder = ['Spring', 'Summer', 'Autumn', 'Winter']
  const currentSeason = getSeason(now, hemisphere).astro
  const currentIdx = seasonOrder.indexOf(currentSeason)
  const nextSeason = seasonOrder[(currentIdx + 1) % 4]
  const nextInfo = seasons[nextSeason]

  const [monthStr, dayStr] = nextInfo.start.split(' ')
  const monthMap = { Mar: 2, Jun: 5, Sep: 8, Dec: 11 }
  const nextDate = new Date(now.getFullYear(), monthMap[monthStr], parseInt(dayStr))
  if (nextDate <= now) nextDate.setFullYear(nextDate.getFullYear() + 1)

  const diff = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24))
  return { days: diff, season: nextSeason, emoji: seasons[nextSeason].emoji }
}

function getDayLength(date, latitude) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const decl = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81))
  const latRad = latitude * Math.PI / 180
  const declRad = decl * Math.PI / 180
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(declRad))
  const dayLength = 2 * hourAngle * 12 / Math.PI
  const hours = Math.floor(dayLength)
  const mins = Math.round((dayLength - hours) * 60)
  return { hours, mins, total: dayLength }
}

export default function SeasonPage() {
  const { addEntry } = useHistory()
  const [today] = useState(() => new Date())
  const [date, setDate] = useState(today.toISOString().split('T')[0])
  const [hemisphere, setHemisphere] = useState('north')
  const [latitude, setLatitude] = useState(40)

  useEffect(() => { addEntry('Season Finder') }, [addEntry])

  const dt = date ? new Date(date + 'T12:00:00') : today
  const season = getSeason(dt, hemisphere)
  const next = getDaysUntilNextSeason(dt, hemisphere)
  const dayLen = getDayLength(dt, latitude)
  const seasons = SEASONS[hemisphere]
  const seasonInfo = seasons[season.astro]

  const dayOfYear = Math.floor((dt - new Date(dt.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const seasonColors = SEASON_COLORS[season.astro]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">🌸</span>
        <h1 className="font-heading text-2xl font-bold text-text">Season Finder</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div className="flex gap-2">
            {['north', 'south'].map(h => (
              <button key={h} onClick={() => setHemisphere(h)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer capitalize ${
                  hemisphere === h ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                }`}>{h} Hemisphere</button>
            ))}
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Approx. Latitude: {latitude}°{latitude >= 0 ? 'N' : 'S'}</label>
            <input type="range" min={-90} max={90} value={latitude} onChange={e => setLatitude(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
            <div className="flex justify-between text-[10px] text-text-tertiary">
              <span>90°S</span><span>Equator</span><span>90°N</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <motion.div key={date + hemisphere} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 mt-4">
        <GlassCard>
          <div className="p-6 text-center space-y-4">
            <div className="text-6xl">{seasonInfo.emoji}</div>
            <div>
              <div className="text-2xl font-bold text-text">{season.astro}</div>
              <div className="text-sm text-text-secondary">Astronomical Season</div>
              <div className="text-xs text-text-tertiary mt-1">{seasonInfo.desc}</div>
            </div>
            <div className="flex justify-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded bg-surface text-text-secondary border border-border">Meteorological: {season.meteo}</span>
              <span className="px-2 py-0.5 rounded bg-surface text-text-secondary border border-border">{dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(seasons).map(([name, info]) => (
            <GlassCard key={name}>
              <div className={`p-3 text-center rounded-xl ${season.astro === name ? 'bg-primary/10 border border-primary/30' : ''}`}>
                <div className="text-2xl mb-1">{info.emoji}</div>
                <div className={`text-sm font-medium ${season.astro === name ? 'text-primary' : 'text-text'}`}>{name}</div>
                <div className="text-[10px] text-text-tertiary">{info.start} – {info.end}</div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard>
            <div className="p-4 text-center">
              <div className="text-[10px] text-text-tertiary mb-1">Days Until {next.season}</div>
              <div className="text-4xl font-bold text-text font-heading">{next.days}</div>
              <div className="text-xs text-text-secondary">{next.emoji} {next.season}</div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4 text-center">
              <div className="text-[10px] text-text-tertiary mb-1">Day Length (approx.)</div>
              <div className="text-4xl font-bold text-text font-heading">{dayLen.hours}h {dayLen.mins}m</div>
              <div className="text-xs text-text-secondary">{dayLen.total.toFixed(1)} hours total</div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">12-Month Calendar ({dt.getFullYear()})</span>
              <CopyButton text={`${season.astro} season on ${dt.toLocaleDateString()}. Next: ${next.season} in ${next.days} days.`} />
            </div>
            <div className="grid grid-cols-12 gap-1">
              {['J','F','M','A','M','J','J','A','S','O','N','D'].map((label, i) => {
                const monthSeasons = Object.entries(seasons).find(([, info]) => info.months.includes(i))
                const isCurrentMonth = dt.getMonth() === i
                return (
                  <div key={i} className="text-center">
                    <div className={`text-[10px] font-medium mb-1 ${isCurrentMonth ? 'text-primary font-bold' : 'text-text-tertiary'}`}>{label}</div>
                    <div className={`h-8 rounded flex items-center justify-center text-sm ${
                      isCurrentMonth ? 'bg-primary/20 border border-primary/40' :
                      monthSeasons ? seasonColors[Object.keys(seasons).indexOf(monthSeasons[0]) % 3] + ' border border-border/30' : 'bg-surface border border-border/30'
                    }`}>
                      {monthSeasons ? seasons[monthSeasons[0]].emoji : ''}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center gap-3 mt-3">
              {Object.entries(seasons).map(([name, info]) => (
                <div key={name} className="flex items-center gap-1">
                  <span className="text-xs">{info.emoji}</span>
                  <span className="text-[10px] text-text-secondary">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
