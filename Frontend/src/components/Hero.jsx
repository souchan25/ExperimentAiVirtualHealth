import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, HeartPulse, Bot, FileText, Activity, Bell, Calendar, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white pt-24 pb-32">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cpsu-green/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cpsu-gold/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Text block */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cpsu-green/10 to-cpsu-gold/10 text-cpsu-green-dark px-4 py-2 rounded-full mb-8"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cpsu-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cpsu-green" />
            </span>
            <span className="text-sm font-semibold tracking-wide uppercase">CPSU AI Virtual Health Assistant</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tight text-gray-900 mb-6 font-outfit"
          >
            Smart <span className="text-cpsu-green">Healthcare</span>{' '}
            <br className="hidden md:block" />
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
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:mt-12"
          >
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-white bg-cpsu-green hover:bg-cpsu-green-dark transition-colors shadow-lg shadow-cpsu-green/30 hover:shadow-cpsu-green/50 hover:-translate-y-0.5 duration-300"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 border border-gray-200 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors hover:-translate-y-0.5 duration-300"
            >
              Explore Features
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </a>
          </motion.div>
        </div>

        {/* ── Realistic Dashboard Mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-20 relative rounded-3xl bg-white/50 backdrop-blur-2xl border border-white/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden p-3 ring-1 ring-black/5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cpsu-green/8 via-transparent to-cpsu-gold/8 pointer-events-none" />

          {/* Browser chrome */}
          <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Browser top bar */}
            <div className="h-12 border-b border-gray-100 bg-gray-50 flex items-center px-4 gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-white rounded-full px-4 py-1.5 flex items-center gap-2 border border-gray-200">
                <div className="w-3 h-3 rounded-full bg-cpsu-green/60" />
                <span className="text-[11px] text-gray-400 font-medium tracking-wide truncate">health.cpsu.edu.ph/student/dashboard</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <Bell className="w-3 h-3 text-amber-500" />
                </div>
                <div className="w-6 h-6 rounded-full bg-cpsu-green flex items-center justify-center text-white text-[9px] font-black">JD</div>
              </div>
            </div>

            {/* App layout */}
            <div className="flex h-[480px]">
              {/* Sidebar */}
              <div className="w-16 border-r border-gray-100 bg-gray-50/80 flex flex-col items-center py-5 gap-4 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-cpsu-green flex items-center justify-center shadow-sm">
                  <HeartPulse className="w-4 h-4 text-white" />
                </div>
                {[Activity, Bot, FileText, Calendar].map((Icon, i) => (
                  <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${i === 0 ? 'bg-cpsu-green/10' : 'hover:bg-gray-100'}`}>
                    <Icon className={`w-4 h-4 ${i === 0 ? 'text-cpsu-green' : 'text-gray-400'}`} />
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 bg-gray-50/30 overflow-hidden flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student Dashboard</p>
                    <h2 className="text-base font-black text-gray-900 font-outfit">Good morning, Juan 👋</h2>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="flex items-center gap-1.5 bg-cpsu-green/10 text-cpsu-green px-3 py-1.5 rounded-full text-[10px] font-bold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cpsu-green animate-ping" />
                    AI Active
                  </motion.div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Wellness Score', value: '87%', color: 'text-cpsu-green', bar: '87%', barColor: 'bg-cpsu-green' },
                    { label: 'Open Records', value: '3', color: 'text-sky-600', bar: '40%', barColor: 'bg-sky-400' },
                    { label: 'Next Appt.', value: 'Mar 15', color: 'text-violet-600', bar: '60%', barColor: 'bg-violet-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                      <p className={`text-lg font-black font-outfit ${s.color}`}>{s.value}</p>
                      <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: s.bar }}
                          transition={{ duration: 1.2, delay: 0.8 }}
                          className={`h-full rounded-full ${s.barColor}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Two-column bottom area */}
                <div className="flex-1 grid grid-cols-5 gap-3 min-h-0">
                  {/* AI Chat preview */}
                  <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">AI Health Assistant</p>
                    <div className="flex-1 space-y-3 overflow-hidden">
                      <div className="flex justify-end">
                        <div className="bg-cpsu-green text-white px-3.5 py-2 rounded-2xl rounded-tr-none text-xs font-medium max-w-[75%] shadow-sm shadow-cpsu-green/15">
                          I've been having a headache since yesterday.
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <div className="w-6 h-6 rounded-full bg-cpsu-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-cpsu-green" />
                        </div>
                        <div className="bg-gray-50 border border-gray-100 px-3.5 py-2 rounded-2xl rounded-tl-none text-xs text-gray-600 shadow-sm max-w-[80%]">
                          <span className="font-bold text-cpsu-green block mb-0.5">HealthAI</span>
                          I understand. Could you describe the pain location? Is it throbbing or a constant pressure?
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 h-8 bg-gray-50 rounded-lg border border-gray-100 px-3 flex items-center">
                        <span className="text-[10px] text-gray-300">Type your message…</span>
                      </div>
                      <div className="w-8 h-8 bg-cpsu-green rounded-lg flex items-center justify-center shadow-sm shadow-cpsu-green/20">
                        <ChevronRight className="text-white h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Right panel */}
                  <div className="col-span-2 flex flex-col gap-3">
                    {/* Wellness card */}
                    <div className="bg-gradient-to-br from-cpsu-green to-emerald-600 rounded-xl p-4 text-white shadow-md shadow-cpsu-green/20 flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">Today's Wellness</p>
                      <p className="text-xl font-black font-outfit">Excellent</p>
                      <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '87%' }}
                          transition={{ duration: 1.2, delay: 1 }}
                          className="h-full bg-cpsu-gold rounded-full"
                        />
                      </div>
                      <p className="mt-1 text-[9px] text-white/60">87 / 100 points</p>
                    </div>

                    {/* Upcoming reminder */}
                    <div className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-md bg-amber-50 flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-amber-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Upcoming</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900">Clinic Appointment</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Mar 15 · 10:00 AM · Dr. Santos</p>
                    </div>
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
