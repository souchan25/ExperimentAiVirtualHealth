import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ShieldAlert, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import axios from 'axios';

// Since this is just an admin settings panel, we use axios directly with the token
const getToken = () => localStorage.getItem('token');
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SystemPermissionsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_URL}/settings/system`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSettings(resp.data);
    } catch (err) {
      console.error("Failed to fetch system settings", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key, currentValue) => {
    setSaving(true);
    try {
      const newValue = !currentValue;
      const resp = await axios.put(`${API_URL}/settings/system/${key}`, 
        { setting_value: { enabled: newValue } },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      setSettings(settings.map(s => s.setting_key === key ? resp.data : s));
      setMessage('Permission updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Failed to update setting", err);
      setMessage('Failed to update permission.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 pb-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black font-outfit text-gray-900 tracking-tight">System Permissions</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Global Access Configuration</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto space-y-6">
            {message && (
              <div className={`p-4 rounded-2xl text-sm font-bold tracking-wide flex items-center gap-3 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-600" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading permissions...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.map((setting) => {
                  const isEnabled = setting.setting_value?.enabled || false;
                  // Formatting the key for display
                  const title = setting.setting_key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  
                  return (
                    <div key={setting.setting_key} className="flex items-start justify-between p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-purple-100 transition-colors group">
                      <div className="flex-1 pr-6">
                        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{setting.description}</p>
                      </div>
                      <button 
                        onClick={() => toggleSetting(setting.setting_key, isEnabled)}
                        disabled={saving}
                        className={`transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${isEnabled ? 'text-green-500' : 'text-gray-300'}`}
                      >
                        {saving ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : isEnabled ? (
                          <ToggleRight className="w-12 h-12 stroke-[1.5]" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 stroke-[1.5]" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SystemPermissionsModal;
