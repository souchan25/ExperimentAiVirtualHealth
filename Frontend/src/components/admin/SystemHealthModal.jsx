import React, { useState, useEffect } from 'react';
import { X, Activity, Server, Database, Cpu, Clock, RefreshCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { staffService } from '../../api/service';

const SystemHealthModal = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
      const interval = setInterval(fetchHealth, 10000); // Auto-refresh every 10s
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchHealth = async () => {
    setError('');
    try {
      const data = await staffService.getHealth();
      setHealthData(data);
    } catch (err) {
      setError('Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-purple-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-outfit">System Health</h2>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Real-time Monitoring</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {loading && !healthData ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <p className="text-gray-500 font-bold">Initializing monitor...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3 text-red-600 font-bold">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Database</p>
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-black text-gray-900 font-outfit uppercase">{healthData.database}</h3>
                       <div className={`w-2 h-2 rounded-full ${healthData.database === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Server className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">API Engine</p>
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-black text-gray-900 font-outfit uppercase">{healthData.status}</h3>
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Version</p>
                    <h3 className="text-sm font-black text-gray-900 font-outfit uppercase">v1.0.0-PROD</h3>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Server Time</p>
                    <h3 className="text-[10px] font-bold text-gray-600 font-mono truncate">{healthData.server_time}</h3>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCcw className="w-4 h-4 text-purple-600 animate-spin-slow" />
                  <span className="text-xs font-bold text-purple-700">Auto-refreshing live data...</span>
                </div>
                <button 
                  onClick={fetchHealth}
                  className="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-800"
                >
                  Refresh Now
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black uppercase tracking-widest text-gray-600 hover:bg-gray-100 transition-all shadow-sm"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthModal;
