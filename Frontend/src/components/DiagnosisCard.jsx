import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Activity,
  Download,
  Calendar,
  PhoneCall,
  ChevronRight
} from 'lucide-react';

const DiagnosisCard = ({ data }) => {
  if (!data) return null;

  const getTriageStyles = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'emergency': return 'bg-red-50 text-red-700 border-red-100 animate-pulse';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/40 overflow-hidden relative"
    >
      {/* Background Orbs for Depth */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cpsu-green/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />
      
      {/* Card Header & Triage */}
      <div className="p-6 border-b border-slate-100/50 relative">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cpsu-green to-emerald-600 flex items-center justify-center shadow-lg shadow-cpsu-green/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight font-outfit">Virtual Health Assessment</h2>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cpsu-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cpsu-green"></span>
                </span>
                CPSU AI VERIFICATION ACTIVE
              </p>
            </div>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full border-2 font-black text-xs tracking-wider uppercase shadow-sm ${getTriageStyles(data.triageLevel)}`}>
            {data.triageLevel} Risk
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100/50 backdrop-blur-md shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cpsu-green/30" />
            <p className="text-slate-700 text-sm leading-relaxed italic relative z-10">"{data.summary}"</p>
          </div>

          {data.reasoning && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="px-5 py-3 border-l-2 border-slate-200"
            >
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Activity className="w-3 h-3" /> AI Reasoning
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{data.reasoning}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Conditions & Probability */}
      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Bot className="w-3.5 h-3.5" /> Likely Conditions & Descriptions
          </h3>
          <div className="space-y-4">
            {data.conditions?.map((c, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-cpsu-green transition-colors">{c.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{c.probability}% match</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${c.probability}%` }}
                    transition={{ duration: 1.2, delay: 0.5 + (i * 0.1), ease: "circOut" }}
                    className={`h-full rounded-full shadow-sm ${c.probability > 70 ? 'bg-gradient-to-r from-cpsu-green to-emerald-400' : c.probability > 30 ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-slate-300'}`}
                  />
                </div>
                {c.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-1 italic border-l border-slate-100 ml-1">
                    {c.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommendations & Red Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cpsu-green" /> Recommendations
            </h3>
            <ul className="space-y-3">
              {data.recommendations?.map((rec, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  className="flex gap-3 text-xs text-slate-600 items-start"
                >
                  <span className="mt-0.5 w-5 h-5 shrink-0 rounded-lg bg-cpsu-green/10 text-cpsu-green flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                    {i+1}
                  </span>
                  <span className="pt-0.5 font-medium">{rec}</span>
                </motion.li>
              ))}
            </ul>
            
            {data.timeframe && (
              <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 backdrop-blur-sm">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Suggested Timeframe
                </p>
                <p className="text-[11px] text-blue-800 font-medium leading-relaxed">{data.timeframe}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-orange-50/80 rounded-2xl border-2 border-orange-100 shadow-lg shadow-orange-100/20 backdrop-blur-md overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200/20 rounded-full -mr-8 -mt-8 blur-xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-[10px] font-bold text-orange-700 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                <AlertCircle className="w-3.5 h-3.5" /> URGENT: Red Flags
              </h3>
              <ul className="space-y-2.5 relative z-10">
                {data.redFlags?.map((flag, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 + (i * 0.1) }}
                    className="flex items-start gap-2.5 text-[11px] text-orange-900 font-bold leading-tight"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-500/50" />
                    {flag}
                  </motion.li>
                ))}
              </ul>
            </div>

            {data.citations && data.citations.length > 0 && (
              <div className="px-2">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sources & Guidelines</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.citations.map((cite, i) => (
                    <span key={i} className="text-[9px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      {cite}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative group/footer">
        <div className="p-5 bg-slate-900 flex flex-wrap items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-white/10 rounded-md text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">Overall Confidence</div>
            <div className="text-2xl font-black text-white flex items-baseline gap-0.5 font-outfit">
              {data.confidence}
              <span className="text-sm font-bold text-cpsu-green">%</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button className="group flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-xs hover:bg-white hover:text-slate-900 transition-all duration-300 border border-white/10 hover:border-white shadow-lg shadow-black/20">
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" /> Save PDF
            </button>
            <button className="group flex items-center gap-2 px-5 py-2 bg-cpsu-green text-white rounded-xl font-black text-xs hover:bg-cpsu-green-dark transition-all duration-300 shadow-xl shadow-cpsu-green/30 hover:shadow-cpsu-green/50 active:scale-95">
              Next Steps <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Disclaimer Section */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100/50 backdrop-blur-md">
        <div className="flex items-start gap-3 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-400 leading-relaxed">
            <strong className="text-slate-500 uppercase tracking-wider mr-1">Medical Disclaimer:</strong> 
            {data.disclaimer || "This content is for informational purposes and provides general wellness insights. It is not a clinical diagnosis or medical advice. Always seek the guidance of CPSU clinic staff or a qualified doctor for any health-related concerns."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DiagnosisCard;
