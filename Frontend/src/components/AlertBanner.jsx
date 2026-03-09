import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Info, Megaphone, ShieldAlert, ChevronRight } from 'lucide-react';
import { alertService } from '../api/service';

const AlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      setCurrentIndex(prev => (alerts.length > 0 ? (prev + 1) % alerts.length : 0));
    }, 8000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getActiveAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];

  const getStyle = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600 text-white border-red-700';
      case 'High': return 'bg-amber-500 text-white border-amber-600';
      case 'Medium': return 'bg-blue-600 text-white border-blue-700';
      default: return 'bg-gray-800 text-white border-gray-900';
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentAlert.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full py-4 px-6 border-b shadow-lg relative overflow-hidden transition-colors ${getStyle(currentAlert.severity)}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              {currentAlert.severity === 'Critical' ? <ShieldAlert className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-0.5">
                 <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md border border-white/20">
                  {currentAlert.severity} ALERT
                </span>
                <span className="text-sm font-black font-outfit truncate">{currentAlert.title}</span>
              </div>
              <p className="text-xs opacity-90 truncate font-medium">{currentAlert.message}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {alerts.length > 1 && (
              <div className="hidden md:flex gap-1.5 mr-4">
                {alerts.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'}`} 
                  />
                ))}
              </div>
            )}
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all backdrop-blur-sm border border-white/20">
              Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Animated Background Element */}
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertBanner;
