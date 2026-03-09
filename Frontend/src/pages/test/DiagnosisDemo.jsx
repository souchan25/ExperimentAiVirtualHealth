import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  ShieldCheck, 
  Activity,
  Download,
  Calendar,
  PhoneCall,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DiagnosisDemo = () => {
  // Mock data for the diagnosis card
  const diagnosisData = {
    summary: "Based on your reported symptoms of high fever, persistent cough, and body aches, your profile suggests a viral upper respiratory infection, likely Influenza.",
    conditions: [
      { name: "Influenza (Flu)", probability: 85, type: "Likely" },
      { name: "Common Cold", probability: 40, type: "Possible" },
      { name: "Allergic Rhinitis", probability: 10, type: "Unlikely" }
    ],
    triageLevel: "Moderate", // Low, Moderate, High, Emergency
    recommendations: [
      "Hydrate frequently with water and electrolyte drinks.",
      "Get at least 8-10 hours of rest per day.",
      "Monitor your temperature every 4 hours.",
      "Take OTC paracetamol if fever exceeds 38.5°C."
    ],
    redFlags: [
      "Difficulty breathing or chest pain",
      "Persistent high fever > 40°C",
      "Confusion or severe lethargy"
    ],
    confidence: 88,
  };

  const getTriageStyles = (level) => {
    switch (level) {
      case 'Low': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Emergency': return 'bg-red-50 text-red-700 border-red-100 animate-pulse';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-outfit">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-cpsu-green animate-ping" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Premium UI Demo</span>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Diagnosis Styling Preview</h1>
          <p className="text-slate-500">Showcasing how we can present AI-driven medical assessments.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content: The Diagnosis Card */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
              
              {/* Glassmorphic Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cpsu-green/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              
              {/* Card Header & Triage */}
              <div className="p-8 border-b border-slate-50 relative">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cpsu-green flex items-center justify-center shadow-lg shadow-cpsu-green/20">
                      <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Virtual Health Assessment</h2>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> AI Verification Active
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 ${getTriageStyles(diagnosisData.triageLevel)}`}>
                    <AlertCircle className="w-4 h-4" />
                    {diagnosisData.triageLevel} Risk
                  </div>
                </div>

                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 backdrop-blur-sm">
                  <p className="text-slate-700 leading-relaxed italic">"{diagnosisData.summary}"</p>
                </div>
              </div>

              {/* Conditions & Probability */}
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Bot className="w-4 h-4" /> Likely Conditions
                  </h3>
                  <div className="space-y-3">
                    {diagnosisData.conditions.map((c, i) => (
                      <div key={i} className="group cursor-default">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{c.name}</span>
                          <span className="text-sm font-medium text-slate-400">{c.probability}% confidence</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${c.probability}%` }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            className={`h-full rounded-full ${c.probability > 70 ? 'bg-cpsu-green' : c.probability > 30 ? 'bg-amber-400' : 'bg-slate-300'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cpsu-green" /> Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {diagnosisData.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-cpsu-green/10 text-cpsu-green flex items-center justify-center text-[10px] font-bold">
                            {i+1}
                          </span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <h3 className="text-sm font-bold text-orange-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Red Flags
                    </h3>
                    <ul className="space-y-2">
                      {diagnosisData.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-orange-800 font-medium">
                          <span className="mt-1 w-1 h-1 rounded-full bg-orange-400 shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-[10px] text-orange-600/70 leading-tight">
                      * If you experience any red flags, please proceed to the nearest emergency room immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 bg-slate-900 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-white/40 text-xs font-medium uppercase tracking-widest">Confidence Score</div>
                  <div className="text-3xl font-black text-white">{diagnosisData.confidence}%</div>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg">
                    <Download className="w-4 h-4" /> Export PDF
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-cpsu-green text-white rounded-xl font-bold text-sm hover:bg-cpsu-green-dark transition-colors shadow-lg shadow-cpsu-green/20">
                    Next Steps <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-center text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              <strong>Medical Disclaimer:</strong> This assessment is generated by an Artificial Intelligence and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. 
            </p>
          </motion.div>

          {/* Sidebar: Next Steps CTA */}
          <motion.div 
            className="lg:col-span-4 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 tracking-tight">Need Professional Help?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all group">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-cpsu-green/10 text-cpsu-green flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Book Clinic Visit</div>
                      <div className="text-[10px] text-slate-400">Available Mon-Fri</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cpsu-green transition-colors" />
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all group">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Call University Nurse</div>
                      <div className="text-[10px] text-slate-400">Instant connection</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-cpsu-green rounded-3xl shadow-lg shadow-cpsu-green/20 relative overflow-hidden">
               {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <Info className="w-8 h-8 text-white/50 mb-3" />
                <h3 className="font-bold text-white mb-2 underline decoration-white/30 underline-offset-4">Health Tip</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Influenza is highly contagious. Consider wearing a mask and avoiding crowded areas on campus until your fever has subsided for at least 24 hours.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default DiagnosisDemo;
