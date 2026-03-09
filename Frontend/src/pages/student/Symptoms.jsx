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

        {/* Form and Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
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

          <div>
            {result ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0a192f] rounded-2xl p-8 border border-gray-800 text-white shadow-xl h-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-cpsu-green/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-cpsu-green" />
                  </div>
                  <h2 className="text-2xl font-bold font-outfit">Assessment Complete</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">AI Prediction (Initial)</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cpsu-green to-teal-400">{result.predicted_disease}</p>
                  </div>
                  
                  {result.confidence_score && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Confidence Score</p>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <div 
                          className="bg-cpsu-gold h-2.5 rounded-full" 
                          style={{ width: `${result.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-gray-500">{(result.confidence_score * 100).toFixed(1)}%</p>
                    </div>
                  )}

                  {Array.isArray(result.top_predictions) && result.top_predictions.length > 1 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Other Possible Conditions</p>
                      <div className="space-y-2">
                        {result.top_predictions.slice(1, 3).map((item, idx) => (
                          <div key={`${item.disease}-${idx}`} className="flex items-center justify-between text-sm bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
                            <span className="text-gray-200">{item.disease}</span>
                            <span className="text-gray-400">{(item.confidence * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.description && (
                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">About this condition</p>
                      <p className="text-sm text-gray-200 leading-relaxed">{result.description}</p>
                    </div>
                  )}

                  {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Helpful Tips</p>
                      <ul className="space-y-1">
                        {result.recommendations.map((tip, idx) => (
                          <li key={`${idx}-${tip}`} className="text-sm text-gray-200">- {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(result.precautions) && result.precautions.length > 0 && (
                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Precautions</p>
                      <ul className="space-y-1">
                        {result.precautions.map((item, idx) => (
                          <li key={`${idx}-${item}`} className="text-sm text-gray-200">- {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(result.red_flags) && result.red_flags.length > 0 && (
                    <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                      <p className="text-red-300 text-sm font-semibold mb-2">Seek clinic care soon if you have:</p>
                      <ul className="space-y-1">
                        {result.red_flags.map((flag, idx) => (
                          <li key={`${idx}-${flag}`} className="text-sm text-red-100">- {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.summary && (
                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <p className="text-gray-400 text-sm mb-1">Assessment Notes</p>
                      <p className="text-sm text-gray-200 leading-relaxed">{result.summary}</p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-300">
                      {result.disclaimer || 'This is an AI-generated preliminary assessment and does not constitute a formal medical diagnosis.'} Your primary record has been securely forwarded to the campus clinic.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">Awaiting Assessment</h3>
                <p className="text-gray-500 text-sm max-w-xs">Fill out your symptoms on the left to receive an instant AI evaluation.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Symptoms;
