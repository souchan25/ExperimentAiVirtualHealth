import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentService } from '../../api/service';

const Symptoms = () => {
  const [symptomList, setSymptomList] = useState('');
  const [duration, setDuration] = useState(1);
  const [severity, setSeverity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const symptomsArray = symptomList.split(',').map(s => s.trim()).filter(s => s);

    try {
      const response = await studentService.submitSymptoms({
        symptoms: symptomsArray,
        duration_days: parseInt(duration),
        severity: parseInt(severity)
      });
      setResult(response);
    } catch (error) {
      console.error('Failed to submit symptoms', error);
      alert('Failed to submit symptoms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/student" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-outfit">Symptom Checker</h1>
            <p className="text-gray-500 mt-1">Get an initial AI assessment of how you're feeling.</p>
          </div>
        </div>

        {/* Form and Result - Balanced Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start max-w-6xl mx-auto">
          
          {/* Form Side - Sticky on Desktop */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">What symptoms are you experiencing?</label>
                  <textarea 
                    required
                    value={symptomList}
                    onChange={(e) => setSymptomList(e.target.value)}
                    placeholder="e.g. headache, fever, sore throat (comma separated)"
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cpsu-green transition-all resize-none h-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">How many days have you had these?</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cpsu-green transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Severity (1-10)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="1"
                      max="10"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full accent-cpsu-green"
                    />
                    <span className="font-bold text-gray-900 w-8">{severity}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-cpsu-green hover:bg-cpsu-green-dark focus:outline-none transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      Assess Symptoms
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Result Side */}
          <div className="min-h-[600px]">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0a192f] rounded-3xl p-8 border border-gray-800 text-white shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-cpsu-green/20 flex items-center justify-center border border-cpsu-green/30">
                    <CheckCircle2 className="w-8 h-8 text-cpsu-green" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-outfit">Assessment Complete</h2>
                    <p className="text-gray-400 text-sm">Review your personalized results below.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Top Section - Primary Diagnosis */}
                  <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                      <div>
                        <p className="text-cpsu-green text-xs font-bold tracking-wider uppercase mb-1">AI Prediction</p>
                        <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cpsu-green to-teal-300">{result.predicted_disease}</h3>
                      </div>
                      
                      <div className="flex flex-col md:items-end bg-gray-900/40 p-4 rounded-xl border border-gray-700/30 min-w-[220px] self-start shadow-inner">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2.5">Confidence Level</p>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="w-full md:w-32 bg-gray-950 rounded-full h-2 overflow-hidden border border-gray-800 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
                            <motion.div 
                              className="bg-gradient-to-r from-cpsu-gold to-yellow-400 h-full rounded-full shadow-[0_0_8px_rgba(255,191,0,0.4)]" 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.confidence_score * 100}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                            />
                          </div>
                          <span className="text-2xl font-black text-cpsu-gold tracking-tight tabular-nums">{(result.confidence_score * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {result.reasoning && (
                      <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-4 bg-blue-400 rounded-full" />
                          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">Clinical Reasoning</p>
                        </div>
                        <p className="text-sm text-blue-100/90 leading-relaxed italic border-l-2 border-blue-500/30 pl-4 py-1">
                          "{result.reasoning}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Other Conditions & About */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* About */}
                    <div className="p-5 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-3">About this condition</p>
                      <p className="text-sm text-gray-200 leading-relaxed">{result.description}</p>
                    </div>

                    {/* Other suggestions */}
                    {Array.isArray(result.top_predictions) && result.top_predictions.length > 1 && (
                      <div className="p-5 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                        <p className="text-gray-400 text-xs font-bold uppercase mb-3">Other Considerations</p>
                        <div className="space-y-2">
                          {result.top_predictions.slice(1, 4).map((item, idx) => (
                            <div key={`${item.disease}-${idx}`} className="flex items-center justify-between text-sm bg-gray-900/50 rounded-lg px-3 py-2.5 border border-gray-800">
                              <span className="text-gray-300">{item.disease}</span>
                              <span className="text-cpsu-gold font-medium">{(item.confidence * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guidance Section - Two Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tips & Precautions */}
                    <div className="space-y-6">
                      {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
                        <div className="p-5 bg-cpsu-green/5 rounded-2xl border border-cpsu-green/20">
                          <p className="text-cpsu-green text-xs font-bold uppercase mb-3">Helpful Tips</p>
                          <ul className="space-y-2">
                            {result.recommendations.map((tip, idx) => (
                              <li key={`${idx}`} className="text-sm text-gray-200 flex gap-3">
                                <span className="text-cpsu-green font-bold">•</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(result.precautions) && result.precautions.length > 0 && (
                        <div className="p-5 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                          <p className="text-gray-400 text-xs font-bold uppercase mb-3">Precautions to Take</p>
                          <ul className="space-y-2">
                            {result.precautions.map((item, idx) => (
                              <li key={`${idx}`} className="text-sm text-gray-300 flex gap-3">
                                <span className="text-gray-500">•</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Urgent Signs & Notes */}
                    <div className="space-y-6">
                      {Array.isArray(result.red_flags) && result.red_flags.length > 0 && (
                        <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/20">
                          <p className="text-red-300 text-xs font-bold uppercase mb-3">Seek Care Immediately if:</p>
                          <ul className="space-y-2">
                            {result.red_flags.map((flag, idx) => (
                              <li key={`${idx}`} className="text-sm text-red-100/90 flex gap-3">
                                <span className="text-red-400 font-bold">!</span> {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.summary && (
                        <div className="p-5 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                          <p className="text-gray-400 text-xs font-bold uppercase mb-2">Assessment Summary</p>
                          <p className="text-sm text-gray-300/90 leading-relaxed italic">"{result.summary}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Disclaimer */}
                  <div className="mt-4 p-5 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {result.disclaimer || 'This is an AI-generated preliminary assessment.'} <br/>
                      <span className="text-cpsu-green/70 font-medium">Your primary diagnostic record has been securely forwarded to the CPSU Campus Clinic.</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-100 rounded-3xl p-12 border border-gray-200 h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Activity className="w-10 h-10 text-cpsu-green animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-outfit">Ready for Assessment</h3>
                <p className="text-gray-500 text-base max-w-sm leading-relaxed">
                  Fill out your current symptoms in the form to receive an instant AI-powered health evaluation.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Symptoms;
