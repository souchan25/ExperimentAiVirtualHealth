import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Stethoscope, Sparkles } from 'lucide-react';

const CTA = () => {
  return (
    <div className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-cpsu-green-dark p-12 md:p-20 text-center shadow-2xl"
        >
          {/* Decorative orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-24 w-96 h-96 bg-cpsu-green/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-72 h-72 bg-cpsu-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cpsu-gold" />
            Now Live at CPSU
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative text-4xl md:text-6xl font-black text-white font-outfit tracking-tight leading-tight"
          >
            Your Health Journey <br />
            Starts <span className="text-cpsu-green">Right Here.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative mt-6 max-w-2xl mx-auto text-lg text-white/60 leading-relaxed"
          >
            Join thousands of CPSU students and staff already using HealthAI to access faster care, smarter records, and real-time wellness support — all with your CPSU credentials.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="group flex items-center gap-3 px-8 py-4 bg-cpsu-green hover:bg-emerald-500 text-white font-bold rounded-2xl text-base transition-all duration-300 shadow-xl shadow-cpsu-green/30 hover:shadow-cpsu-green/50 hover:-translate-y-0.5"
            >
              <GraduationCap className="w-5 h-5" />
              Student Portal Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="group flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-base transition-all duration-300 border border-white/20 hover:border-white/40 backdrop-blur-sm hover:-translate-y-0.5"
            >
              <Stethoscope className="w-5 h-5" />
              Clinic Staff Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55 }}
            className="relative mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/40 text-xs font-medium"
          >
            {['No setup required', 'CPSU credentials only', 'Data Privacy Act compliant', 'Free for all CPSU members'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-cpsu-green inline-block" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CTA;
