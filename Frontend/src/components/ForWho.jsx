import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Stethoscope, HeartPulse, FileText, Bot, Calendar,
  Pill, ClipboardList, BarChart2, Package, Users, ShieldAlert, CheckCircle2
} from 'lucide-react';

const roles = {
  student: {
    label: 'For Students',
    icon: GraduationCap,
    accent: 'cpsu-green',
    tagline: 'Your personal health companion on campus.',
    description:
      'Everything you need to manage your wellbeing — from AI-powered symptom checks to secure medical records — all in one place, available 24/7.',
    features: [
      { icon: Bot, title: 'AI Symptom Checker', desc: 'Describe your symptoms and get an instant preliminary assessment with triage guidance.' },
      { icon: HeartPulse, title: 'Wellness Check-ins', desc: 'Log your daily mood, sleep, and stress. The AI spots trends and nudges you before problems escalate.' },
      { icon: FileText, title: 'Smart Medical Records', desc: 'Upload lab results or certificates and let Vision AI extract and store the clinical data automatically.' },
      { icon: Calendar, title: 'Appointment Booking', desc: 'Book clinic consultations in seconds and get notified of your schedule without any paperwork.' },
      { icon: Pill, title: 'Medication Reminders', desc: 'Never miss a dose. Set up your pillbox and receive smart reminders on your schedule.' },
      { icon: ClipboardList, title: 'Excuse Slip Tracking', desc: 'View and download all clinic-issued excuse slips from your personal records portal.' },
    ],
  },
  staff: {
    label: 'For Clinic Staff',
    icon: Stethoscope,
    accent: 'violet',
    tagline: 'Intelligent tools for a modern campus clinic.',
    description:
      'Manage the entire student health pipeline — from walk-in triage and consultations to inventory and campus-wide health surveillance — with AI doing the heavy lifting.',
    features: [
      { icon: ClipboardList, title: 'Patient Queue & Triage', desc: 'See all incoming cases prioritized by severity. AI flags urgent cases before they reach the desk.' },
      { icon: BarChart2, title: 'Health Analytics Dashboard', desc: 'Real-time charts of campus health trends, disease prevalence, and department-level reports.' },
      { icon: Package, title: 'Clinic Inventory IQ', desc: 'Track medicine and supply stock levels with automated low-stock alerts and restock logs.' },
      { icon: Users, title: 'Student Record Access', desc: 'Access full patient histories, uploaded documents, and AI-extracted clinical summaries instantly.' },
      { icon: FileText, title: 'Prescription & Excuse Slips', desc: 'Issue and digitally sign prescriptions and excuse slips that instantly appear on the student portal.' },
    ],
  },
};

const ForWho = () => {
  const [active, setActive] = useState('student');
  const role = roles[active];
  const Icon = role.icon;

  const isStudent = active === 'student';

  return (
    <div className="py-24 bg-gray-50" id="for-who">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-base text-cpsu-green font-semibold tracking-widest uppercase font-outfit">Built For Everyone</h2>
          <h3 className="mt-2 text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight font-outfit">
            Who is HealthAI <span className="text-cpsu-green">designed for?</span>
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
            One platform, two powerful experiences — tailored to your role at CPSU.
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex justify-center mb-14">
          <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm gap-1">
            {Object.entries(roles).map(([key, r]) => {
              const RIcon = r.icon;
              const sel = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    sel
                      ? key === 'student'
                        ? 'bg-cpsu-green text-white shadow-lg shadow-cpsu-green/25'
                        : 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <RIcon className="w-4 h-4" />
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            {/* Hero blurb */}
            <div className={`relative rounded-3xl overflow-hidden mb-10 p-10 md:p-14 ${
              isStudent
                ? 'bg-gradient-to-br from-cpsu-green to-emerald-700'
                : 'bg-gradient-to-br from-violet-600 to-purple-800'
            }`}>
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">{role.label}</p>
                  <h4 className="text-3xl md:text-4xl font-extrabold text-white font-outfit tracking-tight">{role.tagline}</h4>
                  <p className="mt-3 text-white/80 text-lg max-w-2xl leading-relaxed">{role.description}</p>
                </div>
              </div>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {role.features.map((f, i) => {
                const FIcon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                      isStudent ? 'bg-cpsu-green/10' : 'bg-violet-50'
                    }`}>
                      <FIcon className={`w-5 h-5 ${isStudent ? 'text-cpsu-green' : 'text-violet-600'}`} />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-2">{f.title}</h5>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForWho;
