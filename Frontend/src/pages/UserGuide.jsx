import React, { useState, useEffect } from 'react';
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
  Activity,
  AlertTriangle,
  Package,
  Map
} from 'lucide-react';

const studentGuidelines = [
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

const staffGuidelines = [
  {
    id: 'emergency-hub',
    title: 'Emergency Response Hub',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50',
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>Manage real-time critical alarms and ensure student safety on campus.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>SOS Alerts:</strong> Active emergencies appear on your dashboard. Acknowledge them immediately to stop the pulse.</li>
          <li><strong>Emergency Map:</strong> Use the live map to track the student's precise location and finding the fastest clinical route.</li>
          <li><strong>Resolving:</strong> Only mark an emergency as resolved once the patient has been attended to and the situation is stable.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'records-audit',
    title: 'Medical Documentation Audit',
    icon: FileText,
    color: 'text-cpsu-green bg-cpsu-green/10',
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>Audit and validate patient-submitted health records and excuse slips.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Verification:</strong> Review uploaded PDF documents for authenticity and correct symptom matching.</li>
          <li><strong>Analysis:</strong> Use the system's OCR analysis to quickly scan for key medical terms and clinical markers.</li>
          <li><strong>Security:</strong> All records are AES-256 encrypted. Access is logged for HIPAA compliance.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'consultation-logs',
    title: 'Clinical Consultations',
    icon: Activity,
    color: 'text-purple-600 bg-purple-50',
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>Review patient symptom history and log clinical assessments.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>History Review:</strong> Check a student's daily symptom logs and AI-assistant history before the consultation.</li>
          <li><strong>Clinical Logging:</strong> Document your findings and recommendations directly into the student's digital health folder.</li>
          <li><strong>Follow-ups:</strong> Schedule required follow-up check-ins through the integrated calendar.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'inventory-mgt',
    title: 'Inventory & Stock Control',
    icon: Package,
    color: 'text-blue-600 bg-blue-50',
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>Monitor clinic supply levels and manage medication restocks.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Stock Tracking:</strong> Monitor real-time counts of medications and clinical supplies.</li>
          <li><strong>Low Stock Alerts:</strong> Automated alerts will trigger on your dashboard when items fall below the safety threshold.</li>
          <li><strong>Restocking:</strong> Log manual restocks or prescription deductions via the Inventory tab.</li>
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
  const [role, setRole] = useState('student');
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const user = JSON.parse(saved);
      setRole(user.role || 'student');
      // Set initial open item based on role
      setOpenItem(user.role === 'staff' ? 'emergency-hub' : 'ai-assistant');
    } else {
      setOpenItem('ai-assistant');
    }
  }, []);

  const guidelines = role === 'staff' ? staffGuidelines : studentGuidelines;

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
              {role === 'staff' ? 'Operational Documentation' : 'Documentation'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-outfit tracking-tight flex items-center gap-4">
            {role === 'staff' ? 'Staff' : 'User'} <span className="text-cpsu-green">Guide</span>
            <BookOpen className="w-10 h-10 text-cpsu-gold" />
          </h1>
          <p className="text-gray-500 font-medium mt-3 leading-relaxed max-w-xl">
            {role === 'staff' 
              ? 'Comprehensive manual for clinic staff to manage patient care, emergencies, and inventory efficiently.'
              : 'Learn how to navigate and utilize the HealthAI system effectively to manage your campus healthcare seamlessly.'}
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
          <h3 className="text-2xl font-black font-outfit mb-3">
            {role === 'staff' ? 'System Support' : 'Need More Help?'}
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg">
            {role === 'staff'
              ? 'If you encounter technical issues with the portal or need administrative assistance, please contact the IT support desk.'
              : 'If you encounter any issues or have questions not covered here, the clinic staff is ready to assist you.'}
          </p>
          <button className="px-8 py-4 bg-cpsu-green hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-cpsu-green/20">
            {role === 'staff' ? 'Contact IT Support' : 'Contact Clinic Staff'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
