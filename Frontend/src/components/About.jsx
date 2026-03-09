import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="py-24 bg-white relative overflow-hidden" id="about">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cpsu-green/5 via-white to-white"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 lg:mb-0 relative"
          >
             <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-cpsu-green/20 aspect-square md:aspect-[4/3] bg-gray-100 ring-1 ring-gray-900/5">
                {/* Developer Image Placeholder - Replace with actual image later */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cpsu-green-dark to-cpsu-green-light opacity-90 mix-blend-multiply flex items-center justify-center">
                    <span className="text-white/50 text-6xl font-black font-outfit uppercase tracking-widest rotate-[-15deg]">Developer</span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Students on campus" 
                  className="w-full h-full object-cover mix-blend-overlay"
                />
             </div>
             
             {/* Floating badge */}
             <div className="absolute -bottom-6 -right-6 md:bottom-12 md:-right-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-48 hidden sm:block">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 rounded-full bg-cpsu-gold/20 flex items-center justify-center text-amber-600 font-bold text-xl">🎓</div>
                 <div>
                   <p className="text-sm font-bold text-gray-900">Developed By</p>
                   <p className="text-xs text-gray-500">BSIT Students</p>
                 </div>
               </div>
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-base text-cpsu-green font-semibold tracking-wide uppercase font-outfit">About the Project</h2>
            <h3 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-5xl font-outfit tracking-tight">
              A New Standard for <br /> <span className="text-cpsu-green">Campus Healthcare</span>
            </h3>
            <p className="mt-6 text-xl text-gray-500 leading-relaxed font-light">
              HealthAI has evolved from a student capstone into a comprehensive medical management ecosystem for Central Philippines State University. Our platform bridges the gap between digital innovation and physical care.
            </p>
            <p className="mt-4 text-xl text-gray-500 leading-relaxed font-light">
              By integrating AI-driven wellness tracking, seamless consultation workflows, and intelligent record management, we've created a system that prioritizes student health while optimizing clinic operations for staff.
            </p>
            
            <div className="mt-10 border-t border-gray-100 pt-8">
              <p className="font-semibold text-gray-900 mb-4">Core Technologies Used:</p>
              <div className="flex flex-wrap gap-3">
                {['React', 'Tailwind CSS', 'FastAPI', 'Python', 'OpenAI Vision'].map((tech) => (
                  <span key={tech} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
