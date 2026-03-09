import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../api/service';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Settings, PlusCircle, CheckCircle2, ShieldAlert, Zap, Terminal, Sparkles, ChevronRight, X } from 'lucide-react';
import CreateStaffModal from '../../components/admin/CreateStaffModal';
import UserManagementModal from '../../components/admin/UserManagementModal';
import SystemHealthModal from '../../components/admin/SystemHealthModal';

const ActionCard = ({ title, desc, icon: Icon, onClick, color, delay, accentColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="cursor-pointer group h-full"
    >
      <div className="h-full p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all flex flex-col relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${accentColor}`} />
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${color} shadow-sm`}>
          <Icon className="w-7 h-7" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-black text-gray-900 font-outfit mb-2 group-hover:text-cpsu-green transition-colors flex items-center gap-2">
            {title}
            <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-cpsu-gold" />
          </h3>
          <p className="text-sm text-gray-400 font-medium leading-relaxed uppercase tracking-tight">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await authService.getMe();
        setUser(me);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleStaffSuccess = () => {
    setSuccessMessage('Staff account created successfully!');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">System Administrator</span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-outfit tracking-tight">
              Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-cpsu-green to-cpsu-green-light">Center</span>
            </h1>
            <p className="text-gray-400 font-bold mt-2 flex items-center gap-2 uppercase text-xs tracking-widest">
              <ShieldAlert className="w-4 h-4 text-cpsu-gold" />
              Manage system access and health.
            </p>
          </motion.div>

          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-lg shadow-emerald-500/10"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-tight">{successMessage}</span>
                <button onClick={() => setSuccessMessage('')} className="ml-2 hover:text-emerald-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions Grid */}
        <div data-tour="admin-actions" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard 
            title="Create Staff" 
            desc="Add New Personnel"
            icon={PlusCircle}
            onClick={() => setIsStaffModalOpen(true)}
            color="bg-cpsu-green/10 text-cpsu-green"
            accentColor="bg-cpsu-green"
            delay={0.1}
          />
          <ActionCard 
            title="Manage Users" 
            desc="System Directory"
            icon={Users}
            onClick={() => setIsUserModalOpen(true)}
            color="bg-blue-50 text-blue-600"
            accentColor="bg-blue-600"
            delay={0.2}
          />
          <ActionCard 
            title="System Health" 
            desc="Live Monitoring"
            icon={Activity}
            onClick={() => setIsHealthModalOpen(true)}
            color="bg-purple-50 text-purple-600"
            accentColor="bg-purple-600"
            delay={0.3}
          />
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Recent Activity Logs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="col-span-1 lg:col-span-2"
            data-tour="system-activity"
          >
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-outfit text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-gray-600" />
                  </div>
                  System Activity
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Logs</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 font-mono text-sm">
                {[
                  { type: 'OK', content: 'Database sync complete with Supabase production cluster.', time: '14:02:33', color: 'text-green-500' },
                  { type: 'INFO', content: 'New ML insight generated for symptom record 4B22 (Confidence: 94%).', time: '13:45:12', color: 'text-blue-500' },
                  { type: 'OK', content: 'Secure migration of 1,200+ patient records successfully verified.', time: '11:20:00', color: 'text-green-500' },
                  { type: 'AUTH', content: 'Admin session initiated from authorized IP 192.168.1.1.', time: '10:05:44', color: 'text-purple-500' }
                ].map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    key={i} 
                    className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50 flex items-start gap-4 hover:border-cpsu-green/20 transition-all cursor-default"
                  >
                    <span className="text-gray-300 font-bold shrink-0">{log.time}</span>
                    <span className={`font-black shrink-0 ${log.color}`}>[{log.type}]</span>
                    <span className="text-gray-600 font-medium">{log.content}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* System Overview Snippets */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="col-span-1 space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-cpsu-gold" />
                </div>
                <h3 className="text-xl font-black font-outfit mb-2">Performance API</h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6 leading-relaxed">Latency: 45ms (Normal)</p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-cpsu-gold transition-all">
                  Optimize Cache
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div data-tour="security-pulse" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-black font-outfit text-gray-900 mb-6 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cpsu-green" />
                Security Pulse
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between group cursor-default">
                  <div>
                    <p className="text-sm font-black text-emerald-600 uppercase tracking-tight">SSL Status</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider opacity-70">Active & Valid</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        <CreateStaffModal 
          isOpen={isStaffModalOpen} 
          onClose={() => setIsStaffModalOpen(false)}
          onSuccess={handleStaffSuccess}
        />

        <UserManagementModal 
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
        />

        <SystemHealthModal 
          isOpen={isHealthModalOpen}
          onClose={() => setIsHealthModalOpen(false)}
        />

      </div>
    </div>
  );
};

export default AdminDashboard;

