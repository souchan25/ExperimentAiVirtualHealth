import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, HeartPulse, Building2, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white pt-24 pb-32">
      {/* Decorative background vectors */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cpsu-green/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cpsu-gold/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cpsu-green/10 to-cpsu-gold/10 text-cpsu-green-dark px-4 py-2 rounded-full mb-8"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cpsu-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cpsu-green"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide uppercase">CPSU AI Virtual Health Assistant</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tight text-gray-900 mb-6 font-outfit"
          >
            Smart <span className="text-cpsu-green">Healthcare</span> <br className="hidden md:block" />
            for the CPSU Community
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-3xl mx-auto text-xl text-gray-500 leading-relaxed font-light"
          >
            Experience the future of campus wellness. Our AI-powered platform streamlines consultations, 
            automates medical records, and provides real-time health insights for students and staff alike.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12"
          >
            <div className="rounded-md shadow">
              <a
                href="#get-started"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-cpsu-green hover:bg-cpsu-green-dark md:py-4 md:text-lg md:px-10 transition-colors shadow-lg shadow-cpsu-green/30"
              >
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a
                href="#learn-more"
                className="w-full flex items-center justify-center px-8 py-3 border border-gray-200 text-base font-medium rounded-xl text-cpsu-green-dark bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 relative rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] overflow-hidden p-3 ring-1 ring-black/5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cpsu-green/10 via-transparent to-cpsu-gold/10" />
          <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-[500px] flex flex-col">
             {/* Mock Header */}
            <div className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center px-8 justify-between">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              </div>
              <div className="bg-gray-50 rounded-full px-6 py-1.5 flex items-center border border-gray-100">
                 <span className="text-xs text-gray-400 font-medium tracking-wide">health.cpsu.edu.ph/dashboard</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-cpsu-green/10 border border-cpsu-green/20 animate-pulse"></div>
            </div>
            
            {/* Mock Content */}
            <div className="flex-1 p-10 flex gap-10">
               {/* Left Panel: Wellness & Stats */}
               <div className="w-80 space-y-6">
                  <div className="bg-gradient-to-br from-cpsu-green to-cpsu-green-dark rounded-2xl p-6 text-white shadow-lg shadow-cpsu-green/20">
                     <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Wellness Status</p>
                     <p className="text-2xl font-black mb-4 tracking-tight">Excellent</p>
                     <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 1, delay: 1 }}
                          className="h-full bg-cpsu-gold"
                        />
                     </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-gray-100 rounded"></div>
                        <div className="h-2 w-2 bg-cpsu-green rounded-full animate-ping"></div>
                     </div>
                     <div className="space-y-3">
                        <div className="h-3 w-full bg-gray-50 rounded"></div>
                        <div className="h-3 w-4/5 bg-gray-50 rounded"></div>
                     </div>
                  </div>
               </div>

               {/* Right Panel: Chat/Consultation Mockup */}
               <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100 p-8 flex flex-col">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-end">
                       <div className="bg-cpsu-green text-white px-5 py-3 rounded-2xl rounded-tr-none text-sm font-medium shadow-md shadow-cpsu-green/10">
                          Hi AI, I've been feeling a bit dizzy today.
                       </div>
                    </div>
                    <div className="flex justify-start">
                       <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl rounded-tl-none text-sm text-gray-600 shadow-sm max-w-[80%]">
                          <p className="font-bold text-cpsu-green mb-1">HealthAI Assistant</p>
                          I'm sorry to hear that. Based on your recent wellness data, it might be related to hydration. Would you like to log a consultation?
                       </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                     <div className="flex-1 h-12 bg-white rounded-xl border border-gray-100 shadow-sm"></div>
                     <div className="w-12 h-12 bg-cpsu-green rounded-xl shadow-lg shadow-cpsu-green/20 flex items-center justify-center">
                        <ChevronRight className="text-white h-5 w-5" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
