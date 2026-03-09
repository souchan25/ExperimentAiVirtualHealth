import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'Who can use the HealthAI Assistant?',
    answer: 'The platform is available to all currently enrolled students, faculty, and staff of Central Philippines State University. You must use your valid CPSU credentials to log in.',
  },
  {
    question: 'Is the symptom checker an official medical diagnosis?',
    answer: 'No. The AI symptom checker provides initial guidance and triage recommendations based on the information you provide. It is not a substitute for a professional medical diagnosis from the campus clinic or a licensed physician.',
  },
  {
    question: 'How does the Medical Document AI work?',
    answer: 'When you upload a medical certificate or lab result, our secure Vision AI scans the document, extracts key clinical data (like dates, diagnoses, or test results), and automatically updates your health profile for the clinic staff to review.',
  },
  {
    question: 'Is my medical data kept private?',
    answer: 'Yes. All data is encrypted and handled in strict compliance with the Data Privacy Act of 2012. Only authorized clinic personnel have access to your detailed health records.',
  },
  {
    question: 'What should I do in a medical emergency?',
    answer: 'For life-threatening emergencies, immediately call the campus emergency hotline or proceed to the nearest hospital. Do not rely solely on the AI assistant for acute emergency care.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-24 bg-gray-50" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-outfit">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Everything you need to know about navigating the HealthAI platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-cpsu-green/30 transition-colors"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-cpsu-green transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5 text-gray-600 border-t border-gray-100 pt-4"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
