import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  Map
} from 'lucide-react';
import { staffService, authService, inventoryService } from '../../api/service';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${color} group-hover:scale-150 transition-transform duration-700`} />
    <div className="flex items-center gap-5">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-500 ${color} bg-white ring-1 ring-gray-100`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
        <p className="text-4xl font-black text-gray-900 font-outfit leading-none">{value}</p>
      </div>
    </div>
  </motion.div>
);

const QuickAction = ({ title, description, icon: Icon, onClick, color }) => (
  <motion.button 
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left flex items-start gap-6 group overflow-hidden relative"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-5 ${color} group-hover:scale-150 transition-transform duration-700`} />
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${color} text-white`}>
      <Icon className="w-7 h-7" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-black text-gray-900 font-outfit">{title}</h3>
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-cpsu-green group-hover:translate-x-2 transition-all" />
      </div>
      <p className="text-sm text-gray-400 font-medium leading-relaxed">{description}</p>
    </div>
  </motion.button>
);

const StaffDashboard = () => {
  const [stats, setStats] = useState({ total_students: 0, total_symptom_records: 0 });
  const [emergencies, setEmergencies] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [me, statsData, activeEmergencies, inventoryItems] = await Promise.all([
          authService.getMe(),
          staffService.getDashboardStats(),
          staffService.getActiveEmergencies(),
          inventoryService.getItems()
        ]);
        setUser(me);
        setStats(statsData);
        setEmergencies(activeEmergencies);
        setLowStockItems(inventoryItems.filter(item => item.current_stock <= item.min_stock_level));
      } catch (err) {
        console.error("Failed to load staff data", err);
      }
    };
    fetchData();
  }, []);

  const handleResolve = async (id) => {
    try {
      await staffService.resolveEmergency(id, "Resolved by staff");
      setEmergencies(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to resolve emergency.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-cpsu-green/10 text-cpsu-green text-[10px] font-black uppercase tracking-widest rounded-full">Clinic Command Center</span>
            <div className="w-2 h-2 rounded-full bg-cpsu-gold animate-pulse" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 font-outfit tracking-tight">
            Greetings, <span className="text-cpsu-green">Staff</span>
          </h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Operational Overview & Clinical Management</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-cpsu-gold/10 text-cpsu-gold rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Time</p>
            <p className="text-sm font-black text-gray-900 font-outfit">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div data-tour="staff-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={stats.total_students} icon={Users} color="text-blue-600" delay={0.1} />
        <StatCard title="Clinical Reviews" value={stats.total_symptom_records} icon={Activity} color="text-purple-600" delay={0.2} />
        <StatCard title="Active Alarms" value={emergencies.length} icon={AlertTriangle} color="text-red-600" delay={0.3} />
        <StatCard title="Efficiency Rate" value="98%" icon={TrendingUp} color="text-cpsu-green" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Emergencies & Alerts */}
        <div className="xl:col-span-2 space-y-8">
          {/* Active Emergencies */}
          <div data-tour="emergency-response" className="bg-white rounded-[3rem] border border-red-50 p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-red-50 rounded-full opacity-20 blur-3xl" />
            
            <div className="flex items-center justify-between mb-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black font-outfit text-gray-900 tracking-tight">Emergency Response</h2>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Real-time critical alarms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-5 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">
                  {emergencies.length} ACTIVE
                </span>
                <button
                  onClick={() => navigate('/staff/emergency-map')}
                  className="px-5 py-2 bg-white border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-gray-50"
                >
                  Open Map
                </button>
              </div>
            </div>
            
            {emergencies.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <CheckCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">No critical responses required</p>
              </div>
            ) : (
              <div className="space-y-4 relative">
                {emergencies.map(alert => (
                  <motion.div 
                    layout
                    key={alert.id} 
                    className="p-6 rounded-[2rem] bg-white border border-red-100 flex flex-col md:flex-row justify-between md:items-center gap-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-12 bg-red-600 rounded-full" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-gray-900 font-outfit uppercase tracking-wider text-sm">LOCATION: {alert.location}</h3>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-2">{alert.description}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-red-600/50 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black transition-all shadow-lg shadow-red-100 active:scale-95"
                    >
                      Acknowledge & Resolve
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Section */}
          {lowStockItems.length > 0 && (
            <div className="bg-white rounded-[3rem] border border-cpsu-gold/20 p-10 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cpsu-gold text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cpsu-gold/20">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black font-outfit text-gray-900 tracking-tight">Inventory Alert</h2>
                    <p className="text-[10px] font-black text-cpsu-gold uppercase tracking-widest">Restock required immediately</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {lowStockItems.map(item => (
                  <div key={item.id} className="bg-gray-50 px-6 py-4 rounded-[1.5rem] border border-gray-100 flex items-center gap-4 group/item hover:bg-white hover:shadow-md transition-all">
                    <div>
                      <span className="block text-sm font-black text-gray-900 uppercase tracking-tight">{item.name}</span>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.15em] animate-pulse">
                        {item.current_stock} {item.unit} REMAINING
                      </span>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => navigate('/staff/inventory')}
                  className="flex items-center gap-2 px-6 py-4 bg-cpsu-gold/10 text-cpsu-gold font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-cpsu-gold hover:text-white transition-all"
                >
                  Manage Stock <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions */}
        <div data-tour="management-console" className="space-y-6">
          <h2 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Management Console</h2>
          <QuickAction 
            title="Medical Records" 
            description="Audit and validate patient-submitted medical documentation."
            icon={FileText}
            color="bg-cpsu-green"
            onClick={() => navigate('/staff/records')}
          />
          <QuickAction 
            title="Emergency Map" 
            description="Track active SOS alerts and get fastest clinic-to-patient route."
            icon={Map}
            color="bg-red-600"
            onClick={() => navigate('/staff/emergency-map')}
          />
          <QuickAction 
            title="Consultation Logs" 
            description="Review clinical assessments and diagnostic history."
            icon={Activity}
            color="bg-purple-600"
            onClick={() => navigate('/staff/consultations')}
          />
          <QuickAction 
            title="Appointment Hub" 
            description="Manage clinical schedules and student bookings."
            icon={Calendar}
            color="bg-blue-600"
            onClick={() => navigate('/staff/appointments')}
          />
          <QuickAction 
            title="Patient Messaging" 
            description="Direct secure communication with university students."
            icon={MessageSquare}
            color="bg-cpsu-gold"
            onClick={() => navigate('/staff/messages')}
          />
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
