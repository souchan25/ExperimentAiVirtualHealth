import React, { useState, useEffect } from 'react';
import { reportService } from '../../api/service';
import { 
  ChartBarIcon, 
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon, 
  FireIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

const StaffReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingXlsx, setIsExportingXlsx] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await reportService.getHealthAudit();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load health reports. Please check your connection or server status.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await reportService.exportPdf();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportXlsx = async () => {
    try {
      setIsExportingXlsx(true);
      await reportService.exportXlsx();
    } finally {
      setIsExportingXlsx(false);
    }
  };

  if (loading) return (
    <div className="p-12 text-center">
      <div className="animate-spin w-8 h-8 border-4 border-cpsu-green border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Analyzing Health Trends...</p>
    </div>
  );

  if (error) return (
    <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100 max-w-2xl mx-auto">
      <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Audit Synchronization Failed</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button 
        onClick={fetchStats}
        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
      >
        Retry Synchronization
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-cpsu-green/10 text-cpsu-green text-[10px] font-black uppercase tracking-widest rounded-full">Systems Audit</span>
            <div className="w-1.5 h-1.5 rounded-full bg-cpsu-gold animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">Health Analytics</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Aggregated University Health Trends & Export Tools</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center justify-center px-6 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExportingPdf ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <DocumentArrowDownIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            )}
            {isExportingPdf ? 'Exporting...' : 'Export PDF Report'}
          </button>
          <button 
            onClick={handleExportXlsx}
            disabled={isExportingXlsx}
            className="flex items-center justify-center px-6 py-4 bg-green-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-green-800 shadow-lg shadow-green-100 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExportingXlsx ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            )}
            {isExportingXlsx ? 'Exporting...' : 'Export Data (XLSX)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">Total Consultations</p>
          <h2 className="text-4xl font-black text-gray-900 font-outfit">{stats?.total_records || 0}</h2>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-red-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <p className="text-red-600/60 font-black uppercase text-[10px] tracking-widest mb-1">Emergency Calls</p>
          <h2 className="text-4xl font-black text-red-600 font-outfit">{stats?.triage_breakdown?.Emergency || 0}</h2>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <p className="text-orange-600/60 font-black uppercase text-[10px] tracking-widest mb-1">High Priority</p>
          <h2 className="text-4xl font-black text-orange-600 font-outfit">{stats?.triage_breakdown?.High || 0}</h2>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 bg-cpsu-green/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <p className="text-cpsu-green/60 font-black uppercase text-[10px] tracking-widest mb-1">Moderate/Low</p>
          <h2 className="text-4xl font-black text-cpsu-green font-outfit">
            {(stats?.triage_breakdown?.Moderate || 0) + (stats?.triage_breakdown?.Low || 0)}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-2xl font-black text-gray-900 font-outfit mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
              <FireIcon className="w-6 h-6" />
            </div>
            Department Hotspots
          </h3>
          <div className="space-y-6">
            {!stats?.department_stats || stats.department_stats.length === 0 ? (
              <div className="py-12 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest italic">No department data available</div>
            ) : (
              stats.department_stats.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-1">
                    <span className="text-gray-700">{dept.department}</span>
                    <span className="text-cpsu-green">{dept.students_with_symptoms} Symptoms Logged</span>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-3 overflow-hidden p-0.5 border border-gray-100">
                    <div 
                      className="bg-gradient-to-r from-cpsu-green to-cpsu-green-light h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min((dept.percentage_with_symptoms || 0) * 1, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-2xl font-black text-gray-900 font-outfit mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            Triage Level Analysis
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(stats?.triage_breakdown || {}).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-xl mr-4 shadow-sm ${
                    level === 'Emergency' ? 'bg-red-600 shadow-red-200' :
                    level === 'High' ? 'bg-orange-500 shadow-orange-200' :
                    level === 'Moderate' ? 'bg-yellow-400 shadow-yellow-200' : 'bg-cpsu-green shadow-green-200'
                  }`}></div>
                  <span className="font-black text-gray-700 uppercase tracking-widest text-[11px]">{level} Priority</span>
                </div>
                <span className="text-2xl font-black text-gray-900 font-outfit group-hover:scale-110 transition-transform">{count}</span>
              </div>
            ))}
            {Object.keys(stats?.triage_breakdown || {}).length === 0 && (
               <div className="py-12 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest italic">No triage records found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReports;
