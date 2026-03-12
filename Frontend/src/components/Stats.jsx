import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, FileText, Bot, HeartPulse } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

function useCountUp(target, duration = 1800, inView = false) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView]);

  return display;
}

function formatValue(value, suffix = '') {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k${suffix}`;
  }
  return `${value.toLocaleString()}${suffix}`;
}

const STAT_CONFIG = [
  {
    key: 'students_served',
    label: 'Students Registered',
    icon: Users,
    color: 'text-cpsu-green',
    bg: 'bg-cpsu-green/10',
    suffix: '',
  },
  {
    key: 'ai_consultations',
    label: 'AI Consultations',
    icon: Bot,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    suffix: '',
  },
  {
    key: 'medical_records',
    label: 'Medical Records',
    icon: FileText,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    suffix: '',
  },
  {
    key: 'wellness_checkins',
    label: 'Wellness Check-ins',
    icon: HeartPulse,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    suffix: '',
  },
];

function StatCard({ config, value, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const count = useCountUp(value, 1600, inView);
  const Icon = config.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center text-center"
    >
      <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-7 h-7 ${config.color}`} />
      </div>
      <p className={`text-4xl font-black tracking-tight font-outfit ${config.color}`}>
        {inView ? formatValue(count, config.suffix) : '—'}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-500">{config.label}</p>
    </motion.div>
  );
}

const Stats = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/stats/public`)
      .then((r) => setData(r.data))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error ? (
          // Silent fallback — show dashes, don't break the page
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STAT_CONFIG.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${s.color}`} />
                  </div>
                  <p className={`text-4xl font-black tracking-tight font-outfit ${s.color}`}>—</p>
                  <p className="mt-1 text-sm font-medium text-gray-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STAT_CONFIG.map((config, index) => (
              <StatCard
                key={config.key}
                config={config}
                value={data ? (data[config.key] ?? 0) : 0}
                index={index}
              />
            ))}
          </div>
        )}

        {data !== null && !error && (
          <p className="text-center mt-8 text-xs text-gray-300 font-medium tracking-wide">
            Live counts from the CPSU HealthAI database
          </p>
        )}
      </div>
    </div>
  );
};

export default Stats;
