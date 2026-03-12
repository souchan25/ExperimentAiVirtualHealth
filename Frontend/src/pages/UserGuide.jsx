import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ChevronDown, 
  MessageSquare, 
  ClipboardList, 
  Calendar, 
  Bot, 
  FileText,
  ShieldCheck,
  Stethoscope,
  Activity
} from 'lucide-react';

const guidelines = [
  {
    id: 'ai-assistant',
    title: 'Using the AI Health Assistant',
    icon: Bot,
    color: 'text-blue-500 bg-blue-50',
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>The AI Health Assistant is your first point of contact for medical inquiries available 24/7.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Symptom Checking:</strong> Describe how you feel in detail. The AI will ask follow-up questions to understand your condition better.</li>
          <li><strong>Initial Assessment:</strong> Based on your input, the AI provides a preliminary assessment and recommends next steps.</li>
          <li><strong>Not a Doctor:</strong> Please remember that the AI provides computational guidance, not a definitive medical diagnosis. Always consult clinic staff for serious concerns.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'symptoms',
    title: 'Logging Symptoms & Records',
    icon: ClipboardList,
    color: 'text-cpsu-green bg-cpsu-green/10',
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>Keep a detailed log of your medical history to help clinic staff assist you better.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Symptom Log:</strong> Record your temperature, pain levels, and specific symptoms daily if you are unwell.</li>
          <li><strong>Medical Documents:</strong> Upload medical certificates or lab results. Our system will securely store and analyze them.</li>
          <li><strong>Privacy:</strong> Your medical records are strictly confidential and only accessible by authorized medical personnel.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'appointments',
    title: 'Scheduling Appointments',
    icon: Calendar,
    color: 'text-purple-500 bg-purple-50',
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>Book a consultation with the clinic staff seamlessly.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Booking:</strong> Navigate to the Appointments tab and select an available time slot.</li>
          <li><strong>Purpose:</strong> Briefly describe the reason for your visit so the staff can prepare in advance.</li>
          <li><strong>Rescheduling:</strong> If you cannot make it, please cancel or reschedule your appointment at least 2 hours prior.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'emergencies',
    title: 'Handling Emergencies',
    icon: Activity,
    color: 'text-red-500 bg-red-50',
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>In case of a medical emergency on campus, immediate action is required.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>SOS Button:</strong> Use the emergency trigger in the dashboard to alert staff of your precise location.</li>
          <li><strong>First Aid Knowledge:</strong> Refer to the Knowledge Base tab for immediate instructions on handling common injuries while waiting for help.</li>
          <li><strong>Direct Contact:</strong> You can also message staff directly for urgent but non-critical assistance.</li>
        </ul>
      </div>
    )
  }
];

const AccordionItem = ({ item, isOpen, onClick }) => {
  const Icon = item.icon;
  
  return (
    <div className="border border-gray-100 rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button 
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${item.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 font-outfit text-lg">{item.title}</h3>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-50"
          >
            <div className="p-6 bg-gray-50/50">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserGuide = () => {
  const [openItem, setOpenItem] = useState('ai-assistant');

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-cpsu-green/10 text-cpsu-green text-[10px] font-black uppercase tracking-widest rounded-full">
              Documentation
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-outfit tracking-tight flex items-center gap-4">
            User <span className="text-cpsu-green">Guide</span>
            <BookOpen className="w-10 h-10 text-cpsu-gold" />
          </h1>
          <p className="text-gray-500 font-medium mt-3 leading-relaxed max-w-xl">
            Learn how to navigate and utilize the HealthAI system effectively to manage your campus healthcare seamlessly.
          </p>
        </motion.div>
      </div>

      <div className="space-y-4">
        {guidelines.map((item) => (
          <AccordionItem 
            key={item.id}
            item={item}
            isOpen={openItem === item.id}
            onClick={() => setOpenItem(openItem === item.id ? null : item.id)}
          />
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-10 text-center relative overflow-hidden text-white shadow-xl shadow-gray-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cpsu-green/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md">
            <Stethoscope className="w-8 h-8 text-cpsu-gold" />
          </div>
          <h3 className="text-2xl font-black font-outfit mb-3">Need More Help?</h3>
          <p className="text-gray-400 mb-8 max-w-lg">
            If you encounter any issues or have questions not covered here, the clinic staff is ready to assist you.
          </p>
          <button className="px-8 py-4 bg-cpsu-green hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-cpsu-green/20">
            Contact Clinic Staff
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
