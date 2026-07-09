'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function bmr(m, cm, age, sex) {
  if (sex === 'male') return 10 * m + 6.25 * cm - 5 * age + 5;
  return 10 * m + 6.25 * cm - 5 * age - 161;
}

const categories = [
  { min: 0, max: 18.5, label: 'Underweight', color: 'text-blue-500' },
  { min: 18.5, max: 25, label: 'Normal', color: 'text-green-500' },
  { min: 25, max: 30, label: 'Overweight', color: 'text-yellow-500' },
  { min: 30, max: 35, label: 'Obese Class I', color: 'text-orange-500' },
  { min: 35, max: 40, label: 'Obese Class II', color: 'text-cat-text' },
  { min: 40, max: Infinity, label: 'Obese Class III', color: 'text-red-600' },
];

function getCategory(bmi) {
  return categories.find((c) => bmi >= c.min && bmi < c.max);
}

export default function BmiPage() {
  const { addEntry } = useHistory();
  const [mass, setMass] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(30);
  const [sex, setSex] = useState('male');
  const [unit, setUnit] = useState('metric');

  const m = unit === 'metric' ? mass : mass * 0.453592;
  const cm = unit === 'metric' ? height : height * 2.54;
  const bmiVal = m / ((cm / 100) * (cm / 100));
  const cat = getCategory(bmiVal);
  const bmrVal = bmr(m, cm, age, sex);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">◉</span>
        <h1 className="font-heading text-2xl font-bold text-text">BMI Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="flex gap-2 mb-2">
              {['metric', 'imperial'].map((u) => (
                <button key={u} onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${unit === u ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>{u}</button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Weight ({unit === 'metric' ? 'kg' : 'lb'}): {mass}</label>
                <input type="range" min={20} max={300} value={mass} onChange={(e) => setMass(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Height ({unit === 'metric' ? 'cm' : 'in'}): {height}</label>
                <input type="range" min={unit === 'metric' ? 100 : 40} max={unit === 'metric' ? 250 : 100} value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Age: {age}</label>
                  <input type="range" min={10} max={100} value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Sex</label>
                  <div className="flex gap-2 mt-3">
                    {['male', 'female'].map((s) => (
                      <button key={s} onClick={() => setSex(s)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${sex === s ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 text-center">
              <div className="text-[10px] text-text-tertiary mb-1">Your BMI</div>
              <div className="text-5xl font-mono font-bold text-text mb-2">{bmiVal.toFixed(1)}</div>
              <div className={`text-sm font-semibold ${cat?.color}`}>{cat?.label}</div>

              <div className="mt-4 h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                {categories.slice(0, 5).map((c, i) => {
                  const start = (c.min / 40) * 100;
                  const end = (Math.min(c.max, 40) / 40) * 100;
                  return (
                    <div key={i} className="h-full absolute top-0 opacity-50"
                      style={{ left: `${start}%`, width: `${end - start}%`, backgroundColor: c.color.replace('text-', 'bg-') }} />
                  );
                })}
                <div className="h-full relative">
                  <div className="absolute top-0 w-2 h-full bg-primary rounded-full shadow-md"
                    style={{ left: `${Math.min((bmiVal / 40) * 100, 100)}%`, transform: 'translateX(-50%)' }} />
                </div>
              </div>
              <div className="flex justify-between text-[9px] text-text-secondary mt-1"><span>0</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40</span></div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Estimated BMR</span>
              <div className="text-lg font-mono font-bold text-text">{Math.round(bmrVal)} kcal/day</div>
              <div className="text-[10px] text-text-secondary mt-1">
                {sex === 'male' ? 'Mifflin-St Jeor for males' : 'Mifflin-St Jeor for females'}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
