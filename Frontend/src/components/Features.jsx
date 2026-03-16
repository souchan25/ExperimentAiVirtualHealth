import React from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Activity, ShieldCheck, Clock, Users } from 'lucide-react';

const features = [
  {
    name: 'AI Wellness Tracking',
    description: 'Monitor your daily health and mood. Our AI identifies patterns and suggests proactive wellness steps for student mental and physical health.',
    icon: Activity,
  },
  {
    name: 'Real-time Consultations',
    description: 'Connect instantly with clinic staff through our secure chat. Get professional advice and triage without the wait.',
    icon: Bot,
  },
  {
    name: 'Advanced Medical Records',
    description: 'A comprehensive, digital-first approach to health records. Securely manage certificates, lab results, and consultation histories.',
    icon: FileText,
  },
  {
    name: 'Clinic Inventory IQ',
    description: 'Smart management of medical supplies and medications. Automated alerts for low stock ensure the clinic is always prepared.',
    icon: Clock,
  },
  {
    name: 'ML Diagnostic Insights',
    description: 'Harness the power of machine learning for preliminary symptom analysis and health trend reporting across the campus.',
    icon: Users,
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-base text-cpsu-green font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A smarter way to manage student health
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Everything you need for seamless medical consultations, records management, and clinic operations built into one platform.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="pt-6"
                >
                  <div className="flow-root bg-white rounded-2xl px-6 pb-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full group hover:border-cpsu-green/20">
                    <div className="-mt-6">
                      <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-cpsu-green to-cpsu-green-light rounded-xl shadow-lg shadow-cpsu-green/30 transform group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="mt-8 text-lg font-bold text-gray-900 tracking-tight">{feature.name}</h3>
                      <p className="mt-4 text-base text-gray-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
