import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, FileText, MessageSquare, AlertTriangle, Pill, Heart, X, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import WellnessCheckin from '../../components/WellnessCheckin';
import NotificationCenter from '../../components/NotificationCenter';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { notificationService, authService, studentService } from '../../api/service';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CLINIC_COORDS = [10.015, 122.845];

const clinicIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'hue-rotate-120',
});

const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"></div>
      <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MapViewportController = ({ focusPoint }) => {
  const map = useMap();
  useEffect(() => {
    if (focusPoint) map.flyTo(focusPoint, 18, { duration: 0.8 });
  }, [focusPoint, map]);
  return null;
};

const ActionCard = ({ title, desc, icon: Icon, onClick, link, color, delay, accentColor }) => {
  const CardContent = (
    <div className={`h-full p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all text-left w-full group relative overflow-hidden flex flex-col`}>
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
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {link ? (
        <Link to={link} className="block h-full cursor-pointer group">
          {CardContent}
        </Link>
      ) : (
        <button onClick={onClick} className="block h-full cursor-pointer group w-full">
          {CardContent}
        </button>
      )}
    </motion.div>
  );
};

const StudentDashboard = () => {
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [hasActiveEmergency, setHasActiveEmergency] = useState(false);
  const [isCheckingEmergency, setIsCheckingEmergency] = useState(true);
  const [isTriggeringEmergency, setIsTriggeringEmergency] = useState(false);
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [personalTrends, setPersonalTrends] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [followUser, setFollowUser] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsCheckingEmergency(true);
    setIsLoadingInsights(true);
    try {
      const [me, unread, activeEmergencies, symptoms, trends] = await Promise.all([
        authService.getMe(),
        notificationService.getUnreadCount(),
        studentService.getActiveEmergencies(),
        studentService.getSymptomHistory(),
        studentService.getPersonalTrends()
      ]);
      setUser(me);
      setUnreadCount(unread.count);
      const active = Array.isArray(activeEmergencies) && activeEmergencies.length > 0 ? activeEmergencies[0] : null;
      setHasActiveEmergency(!!active);
      setActiveEmergency(active);
      setSymptomHistory(Array.isArray(symptoms) ? symptoms : []);
      setPersonalTrends(trends);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsCheckingEmergency(false);
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (!hasActiveEmergency || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];
        setUserLocation(coords);

        // Update backend with new location
        if (activeEmergency?.id) {
          try {
            await studentService.updateEmergencyLocation(
              activeEmergency.id,
              `GPS ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Real-time tracking)`
            );
          } catch (err) {
            console.error("Failed to update emergency location:", err);
          }
        }
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [hasActiveEmergency, activeEmergency?.id]);

  const getEmergencyLocation = () => {
    const fallbackLocation = user?.cpsu_address || 'Location unavailable - Student Dashboard SOS';

    if (!navigator.geolocation) {
      return Promise.resolve(fallbackLocation);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`GPS ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Student Dashboard)`);
        },
        () => resolve(fallbackLocation),
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    });
  };

  const handleEmergency = async () => {
    if (isCheckingEmergency || hasActiveEmergency || isTriggeringEmergency) {
      return;
    }

    const confirmed = window.confirm(
      "URGENT: Are you sure you want to trigger an emergency alert? This will immediately notify campus medical staff of your current location."
    );
    
    if (confirmed) {
      setIsTriggeringEmergency(true);
      try {
        const location = await getEmergencyLocation();
        const response = await studentService.triggerEmergency({
          location,
          symptoms: ["Emergency Triggered via SOS Button"],
          description: `SOS distress signal from ${user?.name || 'Student'}`
        });
        setHasActiveEmergency(true);
        setActiveEmergency(response);
        alert("Emergency alert sent! Please stay where you are. Help is on the way.");
      } catch (err) {
        console.error("Failed to trigger emergency:", err);
        if (err?.response?.status === 409) {
          setHasActiveEmergency(true);
          alert("You already have an active emergency case. Please wait for clinic staff to resolve it.");
        } else {
          alert("System Error: Could not send alert. Please call campus security immediately.");
        }
      } finally {
        setIsTriggeringEmergency(false);
      }
    }
  };

  const formatInsightDate = (rawDate) => {
    if (!rawDate) return 'Unknown date';
    try {
      return new Date(rawDate).toLocaleString();
    } catch {
      return 'Unknown date';
    }
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
              <span className="px-3 py-1 bg-cpsu-green/10 text-cpsu-green text-[10px] font-black uppercase tracking-widest rounded-full">Student Portal</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-outfit tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cpsu-green to-cpsu-green-light">{user?.name?.split(' ')[0] || 'Student'}</span>!
            </h1>
            <p className="text-gray-400 font-bold mt-2 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Sparkles className="w-4 h-4 text-cpsu-gold" />
              Your personalized health dashboard is ready.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
             <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group hover:border-cpsu-green/20"
            >
              <Bell className="w-7 h-7 text-gray-300 group-hover:text-cpsu-green transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-cpsu-gold text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#fcfcfd]">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={handleEmergency}
              data-tour="sos-button"
              disabled={isCheckingEmergency || hasActiveEmergency || isTriggeringEmergency}
              title={hasActiveEmergency ? "Clinic has an active emergency case for you. Wait until it is resolved." : ""}
              className={`flex items-center gap-3 px-8 py-4 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg group ${
                isCheckingEmergency || hasActiveEmergency || isTriggeringEmergency
                  ? 'bg-red-300 cursor-not-allowed shadow-red-100'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isCheckingEmergency
                ? 'Checking Status...'
                : isTriggeringEmergency
                  ? 'Sending Alert...'
                  : hasActiveEmergency
                    ? 'Case Under Review'
                    : 'Emergency Help'}
            </button>
          </motion.div>
        </div>

        {/* SOS Map Section (Only visible during active emergency) */}
        <AnimatePresence>
          {hasActiveEmergency && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50/50 border-2 border-red-100 rounded-[2.5rem] p-6 mb-12 shadow-inner overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-red-600 text-[10px] font-black uppercase tracking-widest">Live SOS Status</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 font-outfit">Medical assistance is on the way</h2>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">
                    Your real-time location is being shared with the clinic staff. Please stay calm and remain at your current position.
                  </p>
                  
                  <div className="p-4 bg-white rounded-2xl border border-red-50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-cpsu-green/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-cpsu-green" />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinic Status</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">Staff have been alerted and are reviewing your case.</p>
                  </div>

                  <button
                    onClick={() => setFollowUser(true)}
                    className="w-full py-3 px-6 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
                  >
                    <div className={`w-2 h-2 rounded-full ${followUser ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    Center My Location
                  </button>
                </div>

                <div className="md:w-2/3 h-[350px] bg-white rounded-3xl border border-gray-100 overflow-hidden relative shadow-sm">
                  <MapContainer
                    center={userLocation || CLINIC_COORDS}
                    zoom={17}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    <Marker position={CLINIC_COORDS} icon={clinicIcon}>
                      <Popup>
                        <p className="text-xs font-bold">CPSU Clinic</p>
                      </Popup>
                    </Marker>

                    {userLocation && (
                      <Marker position={userLocation} icon={userIcon}>
                        <Popup>
                          <p className="text-xs font-bold">You are here</p>
                        </Popup>
                      </Marker>
                    )}

                    <MapViewportController focusPoint={followUser ? (userLocation || CLINIC_COORDS) : null} />
                  </MapContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div data-tour="wellness-card">
            <ActionCard 
              title="Wellness Check" 
              desc="Mind & Body Tracker"
              icon={Heart}
              onClick={() => setShowWellnessModal(true)}
              color="bg-red-50 text-red-600"
              accentColor="bg-red-600"
              delay={0.1}
            />
          </div>
          <ActionCard 
            title="Symptoms" 
            desc="AI Assessment"
            icon={Activity}
            link="/student/symptoms"
            color="bg-blue-50 text-blue-600"
            accentColor="bg-blue-600"
            delay={0.2}
          />
          <ActionCard 
            title="AI Health Chat" 
            desc="Virtual Assistant"
            icon={MessageSquare}
            link="/student/chat"
            color="bg-cpsu-green/10 text-cpsu-green"
            accentColor="bg-cpsu-green"
            delay={0.3}
          />
          <ActionCard 
            title="Medical Logs" 
            desc="Health Records"
            icon={FileText}
            link="/student/records"
            color="bg-cpsu-gold/10 text-cpsu-gold"
            accentColor="bg-cpsu-gold"
            delay={0.4}
          />
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="col-span-1 lg:col-span-2"
            data-tour="health-insights"
          >
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-outfit text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-cpsu-green" />
                  </div>
                  Health Insights
                </h2>
                <Link to="/student/medications" className="text-xs font-black uppercase tracking-widest text-cpsu-green hover:text-cpsu-gold transition-colors flex items-center gap-1 group">
                  Pillbox Manager
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-start p-6 text-left rounded-2xl bg-gray-50/50 border border-dashed border-gray-100 overflow-y-auto max-h-[500px]">
                {isLoadingInsights ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                      <Heart className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Loading Health Insights</p>
                    <p className="text-gray-400 text-sm mt-1 max-w-xs text-center">Fetching your latest symptom assessments and community alerts.</p>
                  </div>
                ) : (
                  <div className="w-full space-y-6">
                    {/* Personal Trends Section */}
                    {personalTrends && (
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-cpsu-green/10 to-transparent border border-cpsu-green/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-cpsu-gold" />
                          <h3 className="text-sm font-black text-cpsu-green uppercase tracking-widest">Your Health Overview</h3>
                        </div>
                        <p className="text-base font-bold text-gray-900 leading-tight mb-4">{personalTrends.awareness_message}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {personalTrends.general_tips?.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-white/60 rounded-xl border border-white shadow-sm">
                              <div className="w-2 h-2 rounded-full bg-cpsu-gold mt-1.5 flex-shrink-0" />
                              <span className="text-xs font-bold text-gray-700 leading-relaxed">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Insights */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Your Recent Assessments</h3>
                      {symptomHistory.length > 0 ? (
                        symptomHistory.slice(0, 3).map((entry) => (
                          <div key={entry.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-cpsu-green/30 transition-all">
                            <p className="text-[10px] text-cpsu-green font-black uppercase tracking-widest mb-1">{formatInsightDate(entry.created_at)}</p>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                              AI Assessment: {entry.predicted_disease || 'Pending classification'}
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">
                              Symptoms: {Array.isArray(entry.symptoms) && entry.symptoms.length > 0 ? entry.symptoms.join(', ') : 'No symptom details'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center bg-white rounded-2xl border border-gray-100">
                          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No Recent Health Alerts</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar Area in Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="col-span-1 space-y-6"
          >
            <div className="bg-gradient-to-br from-cpsu-green to-cpsu-green-dark rounded-3xl p-8 text-white shadow-xl shadow-cpsu-green/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <h3 className="text-xl font-black font-outfit mb-2">First Aid Knowledge</h3>
                <p className="text-cpsu-green-light font-bold text-xs uppercase tracking-widest mb-6">Expert Medical Guides</p>
                <Link to="/student/knowledge" className="inline-flex items-center gap-2 px-6 py-3 bg-cpsu-gold text-cpsu-green-dark font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white hover:text-cpsu-green transition-all">
                  Search Guides
                  <BookOpen className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-black font-outfit text-gray-900 mb-6 flex items-center gap-2">
                <Pill className="w-5 h-5 text-cpsu-gold" />
                Daily Checklist
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 hover:bg-cpsu-green/5 border border-gray-100 hover:border-cpsu-green/10 flex items-center gap-4 transition-all group cursor-pointer">
                   <div className="w-10 h-10 bg-white shadow-sm border border-gray-50 text-cpsu-green rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Wellness Check</p>
                    <p className="text-[10px] text-cpsu-green font-bold uppercase tracking-wider opacity-70">Complete Task</p>
                  </div>
                  <div className="ml-auto w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-cpsu-green transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>

      {/* Wellness Modal */}
      <AnimatePresence>
        {showWellnessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <button 
                onClick={() => setShowWellnessModal(false)}
                className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl z-10 hover:bg-red-50 hover:text-red-500 transition-all group"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:rotate-90 transition-transform" />
              </button>
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20">
                <WellnessCheckin onComplete={() => setShowWellnessModal(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

    </div>
  );
};

export default StudentDashboard;
