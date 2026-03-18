import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { staffService } from '../../api/service';

const PerformanceCard = () => {
  const [latency, setLatency] = useState(45);
  const [status, setStatus] = useState('Normal');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const data = await staffService.getPerformance();
        setLatency(data.latency_ms);
        setStatus(data.status);
      } catch (err) {
        console.error("Failed to fetch performance stats", err);
      }
    };

    fetchPerformance();
    const interval = setInterval(fetchPerformance, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, []);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await staffService.optimizeCache();
      setOptimized(true);
      setTimeout(() => setOptimized(false), 3000);
    } catch (err) {
      console.error("Cache optimization failed", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
          <Zap className={`w-6 h-6 ${status === 'Normal' ? 'text-cpsu-gold' : 'text-red-400'}`} />
        </div>
        <h3 className="text-xl font-black font-outfit mb-2">Performance API</h3>
        <p className={`font-bold text-xs uppercase tracking-widest mb-6 leading-relaxed ${status === 'Normal' ? 'text-gray-400' : 'text-red-400 opacity-80'}`}>
          Latency: {latency}ms ({status})
        </p>
        
        <button 
          onClick={handleOptimize}
          disabled={isOptimizing}
          className={`inline-flex items-center gap-2 px-6 py-3 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all ${
            optimized 
            ? 'bg-emerald-500 text-white' 
            : 'bg-white text-gray-900 hover:bg-cpsu-gold'
          }`}
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing...
            </>
          ) : optimized ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Optimized!
            </>
          ) : (
            <>
              Optimize Cache
              <Zap className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PerformanceCard;
