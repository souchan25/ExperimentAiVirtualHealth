import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Secure Authentication',
    description: 'Log in with your official CPSU credentials to access your personalized health dashboard and history.',
  },
  {
    number: '02',
    title: 'Wellness & Assessment',
    description: 'Perform a quick wellness check-in or describe symptoms for an instant AI-powered health assessment.',
  },
  {
    number: '03',
    title: 'Expert Triage',
    description: 'Our system prioritizes your case based on severity, ensuring you get the right level of care when you need it.',
  },
  {
    number: '04',
    title: 'Digital Health Records',
    description: 'Access your consultation history, medical documents, and prescriptions anytime from your secure profile.',
  },
];

const HowItWorks = () => {
  return (
    <div className="py-24 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-sm text-cpsu-green font-bold tracking-widest uppercase mb-3">Process</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight font-outfit">
            How <span className="text-cpsu-green">HealthAI</span> Works
          </h3>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            A seamless, four-step journey to getting the medical assistance you need on campus.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-white border-8 border-gray-50 flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50 z-10 relative">
                     <div className="absolute inset-0 rounded-full border border-cpsu-green/20"></div>
                     <span className="text-3xl font-extrabold text-cpsu-green font-outfit">{step.number}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 font-outfit">{step.title}</h4>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
