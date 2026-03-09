import React, { useState, useEffect } from 'react';
import api, { reportService } from '../../api/service';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardDocumentCheckIcon, 
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const StaffConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('review'); // 'review', 'prescription', 'excuse_slip'

  // Prescription Form State
  const [prescData, setPrescData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    instructions: '',
    purpose: '',
    schedule_times: ['08:00', '20:00']
  });

  // Excuse Slip Form State
  const [slipData, setSlipData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff/symptom-records');
      const normalized = Array.isArray(response.data)
        ? response.data.map((item) => ({
            ...item,
            symptoms: Array.isArray(item.symptoms)
              ? item.symptoms
              : typeof item.symptoms === 'string'
                ? item.symptoms.split(',').map((s) => s.trim()).filter(Boolean)
                : [],
            severity: Number(item.severity) || 1,
            status: item.status || 'pending',
            predicted_disease: item.predicted_disease || 'Unspecified condition',
          }))
        : [];
      setConsultations(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/staff/symptom-records/${selectedConsultation.id}`, {
        status: status,
        staff_notes: notes,
        final_diagnosis: finalDiagnosis
      });
      fetchConsultations();
      setSelectedConsultation(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConsultation?.student_id || !messageBody.trim()) return;
    try {
      setSendingMessage(true);
      await api.post('/messages/', {
        recipient_id: selectedConsultation.student_id,
        content: messageBody.trim(),
      });
      setMessageBody('');
      alert('Message sent to student.');
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const exportReferralPdf = (id) => {
    reportService.exportReferralPdf(id);
  };

  const exportReferralExcel = (id) => {
    reportService.exportReferralXlsx(id);
  };

  const handleQuickMessage = async (consultation) => {
    const content = window.prompt(`Message for ${consultation.user_name || 'student'}:`);
    if (!content || !content.trim()) return;
    try {
      await api.post('/messages/', {
        recipient_id: consultation.student_id,
        content: content.trim(),
      });
      alert('Message sent to student.');
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  const handlePrescribe = async () => {
    if (!selectedConsultation) return;
    try {
      await api.post(`/medications/create?student_id=${selectedConsultation.student_id}`, {
        ...prescData,
        symptom_record_id: selectedConsultation.id
      });
      alert('Prescription issued successfully.');
      setActiveTab('review');
    } catch (err) {
      console.error(err);
      alert('Failed to issue prescription.');
    }
  };

  const handleIssueSlip = async () => {
    if (!selectedConsultation) return;
    try {
      await api.post('/excuse-slips/', {
        ...slipData,
        student_id: selectedConsultation.student_id,
        symptom_record_id: selectedConsultation.id
      });
      alert('Excuse slip issued successfully.');
      setActiveTab('review');
    } catch (err) {
      console.error(err);
      alert('Failed to issue excuse slip.');
    }
  };

  const filtered = consultations.filter((c) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const textMatch =
      !normalizedSearch ||
      c.user_name?.toLowerCase().includes(normalizedSearch) ||
      c.predicted_disease?.toLowerCase().includes(normalizedSearch) ||
      String(c.school_id || '').toLowerCase().includes(normalizedSearch) ||
      c.symptoms?.some((symptom) => String(symptom).toLowerCase().includes(normalizedSearch));

    const statusMatch = statusFilter === 'all' || c.status === statusFilter;
    return textMatch && statusMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-cpsu-green/10 text-cpsu-green text-[10px] font-black uppercase tracking-widest rounded-full">Clinical Queue</span>
            <div className="w-1.5 h-1.5 rounded-full bg-cpsu-gold animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">Consultation Log</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Review student assessments & manage triage workflows</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cpsu-green transition-colors" />
            <input 
              type="text" 
              placeholder="Search patients or conditions..."
              className="w-full md:w-80 pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-cpsu-green/5 focus:border-cpsu-green/20 font-bold text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-600 outline-none pr-1"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="referred">Referred</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-cpsu-green border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Retrieving Clinical Data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200">
              <ClipboardDocumentCheckIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 font-outfit mb-2">Queue is Clear</h3>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No matching consultations found in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-8 py-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">Student Patient</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">Assessment Analysis</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">Clinical Triage</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">System Status</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase tracking-widest text-[10px] text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <motion.tr 
                    layout
                    key={c.id} 
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-cpsu-green/10 text-cpsu-green rounded-2xl flex items-center justify-center mr-4 font-black shadow-sm group-hover:scale-110 transition-transform">
                          {c.user_name?.[0] || 'S'}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 font-outfit uppercase tracking-tight">{c.user_name || 'Anonymous Student'}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {c.school_id ? `${c.school_id} | ` : ''}
                            {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-gray-700 font-outfit tracking-wide">{c.predicted_disease || 'Unspecified condition'}</div>
                      <div className="text-[10px] font-bold text-cpsu-green uppercase tracking-widest mt-1">AI CONFIRMED</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.15em] shadow-sm ${
                        c.severity >= 3 ? 'bg-red-50 text-red-600 border border-red-100' :
                        c.severity === 2 ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-cpsu-green/10 text-cpsu-green border border-cpsu-green/20'
                      }`}>
                        {c.severity === 1 ? 'LOW PRIORITY' : c.severity === 2 ? 'MODERATE' : c.severity === 3 ? 'HIGH URGENCY' : 'CRITICAL'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          c.status === 'resolved' ? 'bg-green-500' : 
                          c.status === 'pending' ? 'bg-cpsu-gold animate-pulse' : 'bg-blue-500'
                        }`} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{c.status || 'pending'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedConsultation(c);
                            setNotes(c.staff_notes || '');
                            setStatus(c.status || 'pending');
                            setFinalDiagnosis(c.final_diagnosis || c.predicted_disease || '');
                            setMessageBody('');
                            setActiveTab('review');
                            setSlipData(prev => ({ ...prev, reason: c.final_diagnosis || c.predicted_disease || '' }));
                          }}
                          className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                          title="Review Assessment"
                        >
                          <ClipboardDocumentCheckIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => exportReferralPdf(c.id)}
                          className="p-3 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                          title="Generate Referral PDF"
                        >
                          <DocumentArrowDownIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleQuickMessage(c)}
                          className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                          title="Message Student"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => exportReferralExcel(c.id)}
                          className="p-3 text-green-700 bg-green-50 hover:bg-green-700 hover:text-white rounded-xl transition-all"
                          title="Data Integration (XLSX)"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedConsultation && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex p-4 md:p-12 z-50 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedConsultation(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden m-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedConsultation(null)}
                className="absolute top-8 right-8 p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all z-20"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

                <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-cpsu-green/5 rounded-full blur-3xl" />
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-cpsu-green text-white rounded-3xl flex items-center justify-center shadow-xl shadow-cpsu-green/20 font-black text-xl">
                      {selectedConsultation.user_name?.[0] || 'S'}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 font-outfit leading-none mb-1">Clinical Review</h2>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">Patient: {selectedConsultation.user_name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-5 bg-gray-50 rounded-[1.8rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Condition Model</p>
                      <p className="font-black text-gray-900 font-outfit">{selectedConsultation.predicted_disease}</p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-[1.8rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Initial Triage</p>
                      <p className={`font-black font-outfit ${
                        selectedConsultation.severity >= 3 ? 'text-red-600' : 'text-cpsu-green'
                      }`}>
                        {selectedConsultation.severity === 1 ? 'Mild' : selectedConsultation.severity === 2 ? 'Moderate' : 'High Urgency'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-gray-50 rounded-[1.8rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reported Symptoms</p>
                      <p className="font-bold text-gray-700 text-sm leading-relaxed">
                        {Array.isArray(selectedConsultation.symptoms) && selectedConsultation.symptoms.length > 0
                          ? selectedConsultation.symptoms.join(', ')
                          : 'No symptoms provided'}
                      </p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-[1.8rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration</p>
                      <p className="font-black text-gray-900 font-outfit">
                        {selectedConsultation.duration_days || 0} day{selectedConsultation.duration_days === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  <div className="flex border-b border-gray-100 mb-8 overflow-x-auto">
                    <button 
                      onClick={() => setActiveTab('review')}
                      className={`px-6 py-4 font-black uppercase tracking-widest text-[10px] whitespace-nowrap transition-all border-b-2 ${
                        activeTab === 'review' ? 'border-cpsu-green text-cpsu-green' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Clinical Review
                    </button>
                    <button 
                      onClick={() => setActiveTab('prescription')}
                      className={`px-6 py-4 font-black uppercase tracking-widest text-[10px] whitespace-nowrap transition-all border-b-2 ${
                        activeTab === 'prescription' ? 'border-cpsu-green text-cpsu-green' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Prescription
                    </button>
                    <button 
                      onClick={() => setActiveTab('excuse_slip')}
                      className={`px-6 py-4 font-black uppercase tracking-widest text-[10px] whitespace-nowrap transition-all border-b-2 ${
                        activeTab === 'excuse_slip' ? 'border-cpsu-green text-cpsu-green' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Excuse Slip
                    </button>
                  </div>

                  {activeTab === 'review' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Final Diagnosis (Editable)</label>
                        <input
                          type="text"
                          value={finalDiagnosis}
                          onChange={(e) => {
                            setFinalDiagnosis(e.target.value);
                            setSlipData(prev => ({ ...prev, reason: e.target.value }));
                          }}
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[1.2rem] outline-none focus:bg-white focus:ring-4 focus:ring-cpsu-green/5 focus:border-cpsu-green/20 font-bold text-sm transition-all"
                          placeholder="Enter final diagnosis..."
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Update Protocol Status</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['pending', 'under_review', 'referred', 'resolved'].map((s) => (
                            <button
                              key={s}
                              onClick={() => setStatus(s)}
                              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                status === s 
                                  ? 'bg-cpsu-green text-white border-cpsu-green shadow-lg shadow-cpsu-green/10' 
                                  : 'bg-white text-gray-500 border-gray-100 hover:border-cpsu-green/30'
                              }`}
                            >
                              {s.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Internal Clinical Notes</label>
                        <textarea 
                          className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none h-40 focus:bg-white focus:ring-4 focus:ring-cpsu-green/5 focus:border-cpsu-green/20 font-bold text-sm transition-all placeholder:text-gray-300 shadow-inner"
                          placeholder="Input diagnostic considerations, staff observations, or patient management directives..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Message Student</label>
                        <div className="flex gap-3">
                          <textarea
                            value={messageBody}
                            onChange={(e) => setMessageBody(e.target.value)}
                            className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-[1.2rem] outline-none h-24 focus:bg-white focus:ring-4 focus:ring-cpsu-green/5 focus:border-cpsu-green/20 font-bold text-sm transition-all"
                            placeholder="Send follow-up instructions to this student..."
                          />
                          <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={sendingMessage || !messageBody.trim()}
                            className="px-5 py-3 h-fit bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {sendingMessage ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={() => setSelectedConsultation(null)}
                          className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 rounded-[1.8rem] transition-all"
                        >
                          Discard Changes
                        </button>
                        <button 
                          onClick={handleUpdate}
                          className="flex-1 py-5 bg-cpsu-green text-white font-black uppercase tracking-widest text-[10px] rounded-[1.8rem] shadow-2xl shadow-cpsu-green/20 hover:bg-black transition-all active:scale-95"
                        >
                          Commit Review
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'prescription' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Medication Name</label>
                          <input
                            type="text"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-bold text-sm transition-all"
                            placeholder="e.g. Paracetamol"
                            value={prescData.name}
                            onChange={(e) => setPrescData({...prescData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Dosage</label>
                          <input
                            type="text"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-bold text-sm transition-all"
                            placeholder="e.g. 500mg"
                            value={prescData.dosage}
                            onChange={(e) => setPrescData({...prescData, dosage: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Frequency</label>
                        <input
                          type="text"
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-bold text-sm transition-all"
                          placeholder="e.g. 3 times a day"
                          value={prescData.frequency}
                          onChange={(e) => setPrescData({...prescData, frequency: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Start Date</label>
                          <input
                            type="date"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-bold text-sm transition-all"
                            value={prescData.start_date}
                            onChange={(e) => setPrescData({...prescData, start_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">End Date</label>
                          <input
                            type="date"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-bold text-sm transition-all"
                            value={prescData.end_date}
                            onChange={(e) => setPrescData({...prescData, end_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Special Instructions</label>
                        <textarea
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none h-24 focus:bg-white font-bold text-sm transition-all"
                          placeholder="e.g. After meals"
                          value={prescData.instructions}
                          onChange={(e) => setPrescData({...prescData, instructions: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={() => setActiveTab('review')}
                          className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 rounded-[1.8rem] transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handlePrescribe}
                          className="flex-1 py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-[1.8rem] shadow-xl shadow-blue-600/20 hover:bg-black transition-all active:scale-95"
                        >
                          Issue Prescription
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'excuse_slip' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Excusal Start</label>
                          <input
                            type="date"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-bold text-sm transition-all"
                            value={slipData.start_date}
                            onChange={(e) => setSlipData({...slipData, start_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Excusal End</label>
                          <input
                            type="date"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white font-bold text-sm transition-all"
                            value={slipData.end_date}
                            onChange={(e) => setSlipData({...slipData, end_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Reason for Excusal</label>
                        <textarea
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none h-32 focus:bg-white font-bold text-sm transition-all"
                          placeholder="Diagnosis or reason for rest..."
                          value={slipData.reason}
                          onChange={(e) => setSlipData({...slipData, reason: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={() => setActiveTab('review')}
                          className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 rounded-[1.8rem] transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleIssueSlip}
                          className="flex-1 py-5 bg-cpsu-gold text-white font-black uppercase tracking-widest text-[10px] rounded-[1.8rem] shadow-xl shadow-cpsu-gold/20 hover:bg-black transition-all active:scale-95"
                        >
                          Issue Excuse Slip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
          </div>
        )}</AnimatePresence>
    </div>
  );
};

export default StaffConsultations;
