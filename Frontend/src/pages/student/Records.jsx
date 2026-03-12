import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, UploadCloud, Loader2, CheckCircle2, AlertCircle, Trash2, ExternalLink, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { documentService, studentService, excuseSlipService, settingsService } from '../../api/service';

const Records = () => {
  const [documents, setDocuments] = useState([]);
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [excuseSlips, setExcuseSlips] = useState([]);
  const [canDeleteRecords, setCanDeleteRecords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDocForAI, setSelectedDocForAI] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const [docs, history, slips, sysSettings] = await Promise.all([
        documentService.getDocuments(),
        studentService.getSymptomHistory(),
        excuseSlipService.getExcuseSlips(),
        settingsService.getSystemSettings().catch(() => [])
      ]);
      setDocuments(docs);
      setSymptomHistory(history || []);
      setExcuseSlips(slips || []);
      
      const deleteSetting = sysSettings.find(s => s.setting_key === 'student_can_delete_records');
      if (deleteSetting && deleteSetting.setting_value?.enabled) {
        setCanDeleteRecords(true);
      } else {
        setCanDeleteRecords(false);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      setError('Failed to load your records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      
      // For now, defaulting document type to 'medical_certificate'
      // You could add a dropdown to select the type
      await documentService.uploadDocument('medical_certificate', file);
      
      setSuccess('Document uploaded successfully!');
      fetchRecords();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await documentService.deleteDocument(id);
      setSuccess('Record deleted successfully.');
      fetchRecords();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete the record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/student" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 font-outfit">Medical Records</h1>
              <p className="text-gray-500 mt-1">Upload and manage your clinical documents.</p>
            </div>
          </div>
          
          <div className="relative">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label 
              htmlFor="file-upload"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer shadow-lg active:scale-95 ${
                uploading 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-cpsu-green text-white hover:bg-cpsu-green-dark shadow-cpsu-green/20'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Upload Document
                </>
              )}
            </label>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{success}</p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
            <Loader2 className="w-10 h-10 text-cpsu-green animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading your records...</p>
          </div>
        ) : documents.length === 0 && symptomHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-outfit">No Records Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              You haven't uploaded any medical certificates or lab results yet. Upload them here to keep them safe and accessible.
            </p>
            <label 
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-6 py-2 text-cpsu-green font-bold hover:bg-cpsu-green/5 rounded-lg transition-colors cursor-pointer"
            >
              Click here to upload your first record
            </label>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-outfit mb-3">Symptom Assessment History</h3>
              {symptomHistory.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500 shadow-sm">
                  No symptom assessments yet. Use the Symptom Checker to create your first entry.
                </div>
              ) : (
                <div className="grid gap-3">
                  {symptomHistory.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="font-bold text-gray-900">
                          {entry.predicted_disease || 'Assessment'}
                        </p>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                        <span className="font-semibold text-gray-700">Symptoms:</span>{' '}
                        {Array.isArray(entry.symptoms) && entry.symptoms.length > 0 ? entry.symptoms.join(', ') : 'N/A'}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">Duration: {entry.duration_days || 0} day{entry.duration_days === 1 ? '' : 's'}</span>
                        <span className="px-2 py-1 rounded-full bg-cpsu-green/10 text-cpsu-green">Severity: {entry.severity || 0}/10</span>
                        <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700">Confidence: {entry.confidence_score ? `${(entry.confidence_score * 100).toFixed(1)}%` : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-outfit mb-3">Uploaded Medical Documents</h3>
              {documents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500 shadow-sm">
                  No uploaded files yet. Use the Upload Document button above to add certificates or lab results.
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-cpsu-green/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-cpsu-green/10 group-hover:text-cpsu-green transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 font-outfit truncate max-w-[200px] sm:max-w-md">
                            {doc.file_name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs font-medium uppercase tracking-wider">
                            <span className="text-gray-400">
                              {new Date(doc.uploaded_at).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              doc.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                              doc.status === 'reviewed' ? 'bg-green-50 text-green-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {doc.status}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-gray-400">
                              {(doc.document_type || 'Record').replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${doc.file_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-cpsu-green hover:bg-cpsu-green-50 rounded-lg transition-all"
                          title="View Document"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button 
                          onClick={() => setSelectedDocForAI(doc)}
                          className="p-2 text-gray-400 hover:text-cpsu-green hover:bg-cpsu-green-50 rounded-lg transition-all"
                          title="AI Summary"
                        >
                          <Sparkles className="w-5 h-5" />
                        </button>
                        {canDeleteRecords && (
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Record"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {excuseSlips.length > 0 && (
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 font-outfit mb-3">Clinic Issued Excuse Slips</h3>
                <div className="grid gap-4">
                  {excuseSlips.map((slip) => (
                    <div 
                      key={slip.id} 
                      className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-cpsu-gold/30 transition-all border-l-4 border-l-cpsu-gold"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cpsu-gold/10 text-cpsu-gold rounded-xl flex items-center justify-center group-hover:bg-cpsu-gold group-hover:text-white transition-colors">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 font-outfit">Medical Excuse Slip</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs font-medium uppercase tracking-wider">
                            <span className="text-gray-400">
                              Issued: {new Date(slip.issued_at).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-cpsu-gold font-bold">
                              {slip.start_date} to {slip.end_date}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{slip.reason}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a 
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${slip.file_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-50 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-cpsu-gold hover:text-white transition-all flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* AI Insights Modal */}
      {selectedDocForAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
                              // Standard format: { key: "...", value: "..." }
                              label = result.key;
                              value = result.value;
                            } else {
                              // Fallback for arbitrary single-pair objects like { "cholesterol": "elevated" }
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
            
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setSelectedDocForAI(null)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
