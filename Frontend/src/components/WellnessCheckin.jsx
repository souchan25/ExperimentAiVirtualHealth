import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Meh, AlertCircle, Zap, Moon, Activity, Send, CheckCircle2, X } from 'lucide-react';
import { wellnessService } from '../api/service';

const WellnessCheckin = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mood: 'Neutral',
    stress_level: 5,
    sleep_hours: 8,
    physical_activity: 'None',
    notes: ''
  });

  const moods = [
    { name: 'Happy', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
    { name: 'Neutral', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Stressed', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Sad', icon: Frown, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Anxious', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' }
  ];

  const handleSubmit = async () => {
    try {
      await wellnessService.createCheckin(formData);
      setStep(4); // Success step
      if (onComplete) setTimeout(onComplete, 2000);
    } catch (err) {
      alert("Failed to submit check-in.");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-gray-900 font-outfit">How are you feeling today?</h2>
            <div className="grid grid-cols-5 gap-3">
              {moods.map((m) => (
                <button
                  key={m.name}
                  onClick={() => setFormData({ ...formData, mood: m.name })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    formData.mood === m.name ? `${m.bg} ring-2 ring-current ${m.color}` : 'hover:bg-gray-50 text-gray-400'
                  }`}
                >
                  <m.icon className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{m.name}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setStep(2)}
              className="w-full py-4 bg-cpsu-green text-white font-bold rounded-2xl shadow-lg shadow-cpsu-green/20 hover:bg-cpsu-green-dark transition-all"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-gray-900 font-outfit">Daily Stats</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Stress Level
                  </span>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                    {formData.stress_level}/10
                  </span>
                </label>
                <input 
                  type="range" min="1" max="10" 
                  className="w-full accent-cpsu-green h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  value={formData.stress_level}
                  onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-500" /> Sleep Hours
                  </span>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    {formData.sleep_hours} hrs
                  </span>
                </label>
                <input 
                  type="range" min="0" max="15" step="0.5"
                  className="w-full accent-cpsu-green h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  value={formData.sleep_hours}
                  onChange={(e) => setFormData({ ...formData, sleep_hours: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-red-500" /> Physical Activity
                </label>
                <div className="flex flex-wrap gap-2">
                  {['None', 'Light', 'Moderate', 'Intense'].map(act => (
                    <button
                      key={act}
                      onClick={() => setFormData({ ...formData, physical_activity: act })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        formData.physical_activity === act ? 'bg-cpsu-green text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-cpsu-green text-white font-bold rounded-2xl shadow-lg shadow-cpsu-green/20 hover:bg-cpsu-green-dark transition-all"
              >
                Almost Done
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-gray-900 font-outfit">Any other notes?</h2>
            <textarea 
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-cpsu-green/20 outline-none h-32 text-sm"
              placeholder="Tell us more about how you're feeling..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setStep(2)}
                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 py-4 bg-cpsu-green text-white font-bold rounded-2xl shadow-lg shadow-cpsu-green/20 hover:bg-cpsu-green-dark transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="w-20 h-20 bg-green-50 text-cpsu-green rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 font-outfit mb-2">Check-in Complete!</h2>
            <p className="text-gray-500">Thanks for tracking your health today.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 text-gray-300 font-black text-4xl opacity-10 pointer-events-none font-outfit">
        Step {step}/3
      </div>
    </div>
  );
};

export default WellnessCheckin;
