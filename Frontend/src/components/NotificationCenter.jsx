import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check, ExternalLink, Calendar, Pill, AlertTriangle, ShieldCheck, MessageSquare, FileText, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../api/service';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (err) {
      alert("Failed to clear notifications.");
    }
  };

  const getIcon = (type) => {
    const t = type?.toLowerCase();
    switch (t) {
      case 'medication': return <Pill className="text-blue-500" />;
      case 'wellness': return <Calendar className="text-green-500" />;
      case 'emergency': return <AlertTriangle className="text-red-500 font-bold" />;
      case 'message': return <MessageSquare className="text-cpsu-green" />;
      case 'document': return <FileText className="text-orange-500" />;
      case 'consultation': return <Stethoscope className="text-purple-500" />;
      default: return <ShieldCheck className="text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cpsu-green/10 text-cpsu-green rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900 font-outfit">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearAll} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
                  Clear All
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close notifications">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-20 text-gray-400 uppercase text-xs font-black tracking-widest animate-pulse">
                  Syncing alerts...
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-4">
                  <BellOff className="w-16 h-16 opacity-10" />
                  <div>
                    <p className="font-bold text-gray-900">All caught up!</p>
                    <p className="text-sm">No new notifications for now.</p>
                  </div>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      notif.is_read ? 'bg-white border-gray-100 opacity-60' : 'bg-cpsu-green/[0.02] border-cpsu-green/10 shadow-sm'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                        {getIcon(notif.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{notif.title}</h4>
                          <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed mb-3">{notif.message}</p>
                        <div className="flex items-center gap-2">
                          {!notif.is_read && (
                            <button 
                              onClick={() => handleMarkRead(notif.id)}
                              className="text-[10px] font-black text-cpsu-green uppercase tracking-widest bg-cpsu-green/10 px-2 py-1 rounded-lg hover:bg-cpsu-green/20"
                            >
                              Mark Read
                            </button>
                          )}
                          {notif.link && (
                            <a 
                              href={notif.link}
                              className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                              View <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {!loading && notifications.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                  Showing your recent {notifications.length} alerts
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
