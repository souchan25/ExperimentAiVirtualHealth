import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, FileText, X, CheckCircle2 } from 'lucide-react';
import api from '../api/service';

const ConsentGate = ({ children, user, onConsent }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.patch('/auth/consent', { data_consent_given: true });
      
      // Update local storage so the change is persistent and immediate
      const updatedUser = { ...user, data_consent_given: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      onConsent();
    } catch (err) {
      console.error('Consent error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If user is not a student or has already given consent, just show the content
  if (user.role !== 'student' || user.data_consent_given) {
    return children;
  }

  return (
    <div className="relative">
      {/* Background content is blurred and non-interactive */}
      <div className="filter blur-md pointer-events-none opacity-50 overflow-hidden h-screen">
        {children}
      </div>

      {/* Modal Backdrop and Content */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Header/Banner Area */}
          <div className="h-2 bg-gradient-to-r from-cpsu-green via-teal-500 to-emerald-400" />
          
          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-cpsu-green/10 rounded-2xl flex items-center justify-center text-cpsu-green shrink-0">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-outfit text-gray-900">Health Data Privacy</h2>
                <p className="text-gray-500 text-sm">Action required to continue to your dashboard</p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <p className="text-gray-600 leading-relaxed">
                Before accessing the <strong>CPSU Virtual Health Assistant</strong>, we need your consent to handle your medical information in accordance with the Data Privacy Act of 2012.
              </p>

              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-hover hover:border-cpsu-green/30">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-cpsu-green shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Secure & Confidential</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Your data is encrypted and only accessible by authorized clinic personnel.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-hover hover:border-cpsu-green/30">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-cpsu-green shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Purpose of Collection</h4>
                    <p className="text-xs text-gray-500 mt-0.5">We collect symptoms to provide AI guidance and better clinical support.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAccept}
                disabled={loading}
                className={`group relative w-full py-4 rounded-xl font-bold text-white transition-all overflow-hidden ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-cpsu-green hover:bg-cpsu-green-dark shadow-xl shadow-cpsu-green/20'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-2 text-lg">
                  {loading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      I Accept & Consent
                      <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </div>
              </button>
              
              <button 
                className="w-full py-3 text-gray-400 font-bold hover:text-red-500 transition-colors text-sm"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                Decline & Sign Out
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-8 uppercase tracking-widest font-medium">
              Data Privacy Act Compliance Unit • CPSU
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsentGate;
