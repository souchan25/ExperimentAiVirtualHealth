import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Code2, Brain, Shield, Github, Linkedin } from 'lucide-react';

const team = [
  {
    name: 'Charyjane C. Cuenca',
    icon: Code2,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    initials: 'CC',
  },
  {
    name: 'Eugene D. Pausa',
    icon: Brain,
    color: 'from-cpsu-green to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    initials: 'EP',
  },
  {
    name: 'Rodylen Sumagaysay',
    icon: Shield,
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    initials: 'RS',
  },
  {
    name: 'Jonel Roy M. Talapeiro',
    icon: GraduationCap,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    initials: 'JT',
  },
];

const techs = ['React', 'Tailwind CSS', 'FastAPI', 'Python', 'PostgreSQL', 'Gemini Vision AI', 'scikit-learn', 'Cloudinary'];

const About = () => {
  return (
    <section className="bg-white relative overflow-hidden" id="about">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cpsu-green/5 via-white to-white pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cpsu-gold/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* ── About the Project ── */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">

          {/* Left image column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 lg:mb-0 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-cpsu-green/20 aspect-[4/3] bg-gray-100 ring-1 ring-gray-900/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-cpsu-green-dark to-cpsu-green opacity-90 mix-blend-multiply flex items-center justify-center">
                <span className="text-white/30 text-7xl font-black font-outfit uppercase tracking-widest rotate-[-15deg] select-none">CPSU</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students on campus"
                className="w-full h-full object-cover mix-blend-overlay"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-4 md:bottom-10 md:-right-8 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hidden sm:block">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-cpsu-gold/20 flex items-center justify-center text-xl">🎓</div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">Capstone Project</p>
                  <p className="text-xs text-gray-500">BSIT — CPSU</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-50 flex -space-x-2">
                {team.map((m) => (
                  <div key={m.name} className={`w-7 h-7 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[9px] font-black ring-2 ring-white`}>
                    {m.initials}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right text column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-base text-cpsu-green font-semibold tracking-widest uppercase font-outfit">About the Project</h2>
            <h3 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight font-outfit">
              A New Standard for <br /><span className="text-cpsu-green">Campus Healthcare</span>
            </h3>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              <strong className="text-gray-700">HealthAI</strong> evolved from a BSIT capstone thesis into a comprehensive medical management ecosystem for Central Philippines State University — bridging digital innovation with physical care.
            </p>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              By integrating AI-driven wellness tracking, seamless consultation workflows, intelligent document parsing via Gemini Vision, and ML-powered diagnostics, we've created a system that prioritizes student health while optimizing clinic operations.
            </p>

            <div className="mt-10 border-t border-gray-100 pt-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core Technologies</p>
              <div className="flex flex-wrap gap-2">
                {techs.map((tech) => (
                  <span key={tech} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:border-cpsu-green/40 hover:bg-cpsu-green/5 transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Meet the Team ── */}
      <div className="border-t border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-base text-cpsu-green font-semibold tracking-widest uppercase font-outfit">The Developers</h2>
            <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
              Meet the <span className="text-cpsu-green">Capstone Team</span>
            </h3>
            <p className="mt-4 max-w-2xl mx-auto text-gray-500 text-lg">
              Bachelor of Science in Information Technology students of Central Philippines State University who designed, built, and deployed this platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => {
              const Icon = member.icon;
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden p-8 flex flex-col items-center text-center"
                >
                  {/* Gradient top accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${member.color}`} />

                  {/* Avatar */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <span className="text-2xl font-black text-white tracking-tight">{member.initials}</span>
                  </div>

                  {/* Info */}
                  <h4 className="font-bold text-gray-900 text-base leading-snug font-outfit">{member.name}</h4>
                  
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${member.bg} ${member.border} border`}>
                    <Icon className="w-3 h-3" />
                    {member.role}
                  </div>

                  <p className="mt-4 text-xs text-gray-400 font-medium uppercase tracking-widest">BSIT · CPSU</p>
                </motion.div>
              );
            })}
          </div>

          {/* University credit pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 flex justify-center"
          >
            <div className="inline-flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-8 py-5 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-cpsu-green/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-cpsu-green" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Capstone Thesis</p>
                <p className="text-sm font-bold text-gray-900">Central Philippines State University</p>
                <p className="text-xs text-gray-500">College of Information Technology · A.Y. 2025–2026</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
