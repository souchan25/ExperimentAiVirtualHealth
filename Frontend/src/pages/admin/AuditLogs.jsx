import React, { useState, useEffect } from 'react';
import api from '../../api/service';
import { ShieldCheckIcon, ClockIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/audit/');
      setLogs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
        <p className="text-gray-500 mt-1">Forensic trace of all significant system actions and data changes.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading audit trail...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-600 text-sm">Timestamp</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Action</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Target</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        log.action === 'LOGIN' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {log.model_name}:{log.object_id}
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center text-sm font-bold ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
