import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  FilePlus, 
  Download, 
  ExternalLink, 
  Loader2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  PlusCircleIcon,
  Trash2,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { documentService, excuseSlipService } from '../../api/service';
import { motion, AnimatePresence } from 'framer-motion';

const MedicalRecords = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // AI Insights State
  const [selectedDocForAI, setSelectedDocForAI] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Excuse Slip Form State
  const [slipForm, setSlipForm] = useState({
    student_id: '',
    symptom_record_id: null,
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [isGeneratingSlip, setIsGeneratingSlip] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSlip = async (e) => {
    e.preventDefault();
    try {
      setIsGeneratingSlip(true);
      await excuseSlipService.createExcuseSlip(slipForm);
      setIssueModalOpen(false);
      setSlipForm({ student_id: '', symptom_record_id: null, start_date: '', end_date: '', reason: '' });
      setSuccessMessage('Excuse slip generated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert("Failed to issue excuse slip.");
    } finally {
      setIsGeneratingSlip(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record? This action cannot be undone and will permanently remove the file.')) {
      return;
    }

    try {
      setLoading(true);
      await documentService.deleteDocument(id);
      setSuccessMessage('Medical record deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDocuments();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete the record.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingStatus(true);
      await documentService.updateDocumentStatus(id, status);
      setSuccessMessage(`Document ${status === 'reviewed' ? 'approved' : status === 'rejected' ? 'declined' : 'status updated'}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedDocForAI(null); // Close modal
      fetchDocuments(); // Refresh list
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update document status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openSlipModal = (doc) => {
    setSlipForm({
      student_id: doc.student_id,
      symptom_record_id: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: doc.file_name
    });
    setIssueModalOpen(true);
  };

  const filteredDocs = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatStudentId = (value, length = 8) => {
    if (value === null || value === undefined) {
      return 'UNKNOWN';
    }

    return String(value).substring(0, length).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <Link to="/staff" className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-cpsu-green">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-cpsu-green/10 text-cpsu-green text-[10px] font-black uppercase tracking-widest rounded-full">Secure Archives</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cpsu-gold animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">Medical Repositories</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Document Validation & Excuse Slip Issuance</p>
          </div>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cpsu-green transition-colors" />
          <input 
            type="text" 
            placeholder="Search filenames, patient IDs..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-cpsu-green/5 focus:border-cpsu-green/20 font-bold text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-sm mx-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
            <Loader2 className="w-12 h-12 text-cpsu-green animate-spin mx-auto mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Accessing Secure Storage...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 font-outfit mb-2">No Records Found</h3>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">The medical repository is currently empty or no matches were found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50 text-gray-400">
                  <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px]">Medical Document</th>
                  <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px]">Patient Identification</th>
                  <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px]">Upload timestamp</th>
                  <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px]">Validation Status</th>
                  <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDocs.map((doc) => (
                  <motion.tr 
                    layout
                    key={doc.id} 
                    className="group hover:bg-gray-50/50 transition-all"
                  >
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-cpsu-green/10 text-cpsu-green rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-cpsu-green group-hover:text-white transition-all shadow-sm">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="block font-black text-gray-900 font-outfit uppercase tracking-tight text-sm mb-1">{doc.file_name}</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[9px] font-black rounded-lg group-hover:bg-cpsu-gold/10 group-hover:text-cpsu-gold transition-colors">{doc.document_type || 'General Record'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-300" />
                        <span className="font-black text-gray-600 font-outfit text-sm">#{formatStudentId(doc.student_id, 8)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-3 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="font-bold text-xs">{new Date(doc.uploaded_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.15em] flex items-center gap-2 w-fit ${
                        doc.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        doc.status === 'reviewed' ? 'bg-cpsu-green/10 text-cpsu-green border border-cpsu-green/20' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'pending' ? 'bg-amber-500 animate-pulse' : doc.status === 'reviewed' ? 'bg-cpsu-green' : 'bg-red-500'}`} />
                        {doc.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <a 
                          href={doc.file_path && /^https?:\/\//i.test(doc.file_path.trim()) ? doc.file_path : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${doc.file_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-cpsu-green hover:shadow-md rounded-xl transition-all"
                          title="Open Archive"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button 
                          onClick={() => setSelectedDocForAI(doc)}
                          className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-cpsu-green hover:shadow-md rounded-xl transition-all"
                          title="AI Summary"
                        >
                          <Sparkles className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:shadow-md rounded-xl transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openSlipModal(doc)}
                          className="p-3 bg-cpsu-green shadow-lg shadow-cpsu-green/10 text-white hover:bg-black rounded-xl transition-all"
                          title="Generate Excuse Slip"
                        >
                          <PlusCircleIcon className="w-5 h-5" />
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

      {/* AI Insights Modal */}
      {selectedDocForAI && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-cpsu-green p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-outfit">AI Health Insights</h3>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Automated Clinical Summary</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDocForAI(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                disabled={updatingStatus}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {!selectedDocForAI.extracted_data || Object.keys(selectedDocForAI.extracted_data).length === 0 ? (
                <div className="text-center py-10">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No automated insights available for this document.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Patient Name</p>
                      <p className="font-bold text-gray-900">{selectedDocForAI.extracted_data.patient_name || 'Not detected'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Test Date</p>
                      <p className="font-bold text-gray-900">{selectedDocForAI.extracted_data.date || 'Not detected'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Test Type</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cpsu-green/10 text-cpsu-green rounded-lg font-bold text-sm">
                      <FileText className="w-4 h-4" />
                      {selectedDocForAI.extracted_data.test_type || (selectedDocForAI.document_type || 'General Record').replace('_', ' ')}
                    </div>
                  </div>

                  {selectedDocForAI.extracted_data.summary && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Clinical Summary</p>
                      <div className="bg-cpsu-green/5 p-4 rounded-2xl border border-cpsu-green/10">
                        <p className="text-sm text-gray-700 leading-relaxed italic">"{selectedDocForAI.extracted_data.summary}"</p>
                      </div>
                    </div>
                  )}

                  {selectedDocForAI.extracted_data.results && Array.isArray(selectedDocForAI.extracted_data.results) && selectedDocForAI.extracted_data.results.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Key Findings</p>
                      <div className="space-y-2">
                        {selectedDocForAI.extracted_data.results.map((result, idx) => {
                          let label, value;
                          if (typeof result === 'object' && result !== null) {
                            if (result.key !== undefined) {
                              label = result.key;
                              value = result.value;
                            } else {
                              const entries = Object.entries(result);
                              label = entries[0]?.[0] ?? 'Finding';
                              value = entries[0]?.[1] ?? '—';
                            }
                          } else {
                            label = 'Finding';
                            value = result;
                          }
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                              <span className="text-sm font-medium text-gray-600">{label}</span>
                              <span className="text-sm font-bold text-gray-900">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    AI-generated summary. Always double-check with the original document.
                  </div>
                </>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => handleUpdateStatus(selectedDocForAI.id, 'action_required')}
                disabled={updatingStatus}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm shadow-sm"
              >
                Request Info
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedDocForAI.id, 'rejected')}
                disabled={updatingStatus}
                className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all text-sm shadow-sm"
              >
                Decline
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedDocForAI.id, 'reviewed')}
                disabled={updatingStatus}
                className="flex-[1.5] py-3 bg-cpsu-green text-white rounded-xl font-bold hover:bg-cpsu-green/90 transition-all text-sm shadow-sm flex items-center justify-center gap-2"
              >
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                {updatingStatus ? 'Updating...' : 'Approve Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Excuse Slip Modal */}
      <AnimatePresence>
        {issueModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-cpsu-green/10 rounded-full blur-3xl opacity-50" />
              
              <div className="relative">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-16 h-16 bg-cpsu-gold text-white rounded-3xl flex items-center justify-center shadow-xl shadow-cpsu-gold/20">
                    <PlusCircleIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 font-outfit leading-none mb-1">Clinic Excuse Slip</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">Official Medical Certification for Patient Excusal</p>
                  </div>
                </div>

                <form onSubmit={handleIssueSlip} className="space-y-8">
                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-cpsu-green uppercase tracking-widest">Validating Patient</p>
                      <p className="text-sm font-black text-gray-900 font-outfit">ID: #{formatStudentId(slipForm.student_id, 12)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Clinical Justification</label>
                    <textarea 
                      className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none h-40 focus:bg-white focus:ring-4 focus:ring-cpsu-green/5 focus:border-cpsu-green/20 font-bold text-sm transition-all shadow-inner"
                      value={slipForm.reason}
                      onChange={(e) => setSlipForm({...slipForm, reason: e.target.value})}
                      placeholder="Input diagnostic considerations for patient excusal..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Duration: From</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input 
                          type="date" 
                          className="w-full p-4 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white font-bold text-xs"
                          value={slipForm.start_date}
                          onChange={(e) => setSlipForm({...slipForm, start_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Duration: To</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input 
                          type="date" 
                          className="w-full p-4 px-6 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white font-bold text-xs"
                          value={slipForm.end_date}
                          onChange={(e) => setSlipForm({...slipForm, end_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 border-t border-gray-50">
                     <button 
                      type="button" 
                      onClick={() => setIssueModalOpen(false)}
                      className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 rounded-[1.8rem] transition-all"
                    >
                      Discard Draft
                    </button>
                    <button 
                      type="submit" 
                      disabled={isGeneratingSlip}
                      className="flex-1 py-5 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-[1.8rem] shadow-2xl shadow-gray-200 hover:bg-cpsu-green transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGeneratingSlip && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isGeneratingSlip ? 'Generating...' : 'Generate Certification'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalRecords;
