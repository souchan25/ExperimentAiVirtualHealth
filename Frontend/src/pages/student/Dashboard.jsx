import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Bell, FileText, MessageSquare, AlertTriangle, Pill, Heart, X,
  BookOpen, ChevronRight, Sparkles, Sun, Moon as MoonIcon, Sunrise, Clock,
  Calendar, Maximize2, Minimize2, CheckCircle2, Stethoscope, ArrowRight, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WellnessCheckin from '../../components/WellnessCheckin';
import NotificationCenter from '../../components/NotificationCenter';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { notificationService, authService, studentService, appointmentService, wellnessService } from '../../api/service';

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

const CLINIC_COORDS = [9.851093, 122.888895];

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

/* ── Helpers ────────────────────────────────────────────── */

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const GreetingIcon = () => {
  const h = new Date().getHours();
  if (h < 12) return <Sunrise className="w-5 h-5 text-amber-400" />;
  if (h < 17) return <Sun className="w-5 h-5 text-yellow-500" />;
  return <MoonIcon className="w-5 h-5 text-indigo-400" />;
};

const moodToValue = (mood) => {
  const map = { Happy: 95, Neutral: 65, Stressed: 35, Sad: 20, Anxious: 15 };
  return map[mood] ?? 50;
};

const computeWellnessScore = (checkin) => {
  if (!checkin) return null;
  const moodScore = moodToValue(checkin.mood);
  const stressScore = ((10 - (checkin.stress_level ?? 5)) / 10) * 100;
  const sleepScore = Math.min(((checkin.sleep_hours ?? 0) / 8) * 100, 100);
  const actMap = { None: 20, Light: 50, Moderate: 75, Intense: 100 };
  const activityScore = actMap[checkin.physical_activity] ?? 30;
  return Math.round((moodScore + stressScore + sleepScore + activityScore) / 4);
};

const formatInsightDate = (raw) => {
  if (!raw) return 'Unknown date';
  try { return new Date(raw).toLocaleString(); } catch { return 'Unknown date'; }
};

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const formatCountdown = (dateStr) => {
  if (!dateStr) return '';
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return 'Now';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

/* ── Sub-Components ─────────────────────────────────────── */

const MapViewportController = ({ focusPoint }) => {
  const map = useMap();
  useEffect(() => {
    if (focusPoint) map.flyTo(focusPoint, 18, { duration: 0.8 });
  }, [focusPoint, map]);
  return null;
};

// Animated Wellness Score Ring (SVG)
const WellnessRing = ({ score, size = 110 }) => {
  const sw = 8;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const progress = score != null ? (score / 100) * circ : 0;
  const color = score >= 75 ? '#2e7d32' : score >= 50 ? '#ffb300' : score >= 25 ? '#f57c00' : '#d32f2f';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={sw} fill="none" className="text-gray-100 dark:text-gray-700" />
        {score != null && (
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black font-outfit text-gray-900 dark:text-white">{score ?? '—'}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Wellness</span>
      </div>
    </div>
  );
};

// 7-day Mood Sparkline (SVG)
const SparklineChart = ({ data, width = 200, height = 48 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pad = 6;
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - 2 * pad),
    y: height - pad - ((v - min) / range) * (height - 2 * pad),
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${pad},${height - pad} ${polyline} ${width - pad},${height - pad}`;
  const last = pts[pts.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2e7d32" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sparkFill)" />
      <polyline points={polyline} fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="4" fill="#2e7d32" />
      <circle cx={last.x} cy={last.y} r="8" fill="#2e7d32" opacity="0.15" />
    </svg>
  );
};

// Skeleton Loading Placeholder
const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse space-y-3">
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2" />
  </div>
);

// Toast Notification
const ToastNotification = ({ toast, onClose }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md ${
          toast.type === 'success' ? 'bg-cpsu-green text-white' : 'bg-red-600 text-white'
        }`}
      >
        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
        <p className="font-bold text-sm">{toast.message}</p>
        <button onClick={onClose} className="ml-2 hover:opacity-70 flex-shrink-0"><X className="w-4 h-4" /></button>
      </motion.div>
    )}
  </AnimatePresence>
);

// Quick Stat Card
const StatCard = ({ label, value, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-black text-gray-900 dark:text-white font-outfit leading-none">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate">{label}</p>
    </div>
  </motion.div>
);

// Action Card (with dark mode + mobile min-width)
const ActionCard = ({ title, desc, icon: Icon, onClick, link, color, delay, accentColor }) => {
  const CardContent = (
    <div className="h-full p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all text-left w-full group relative overflow-hidden flex flex-col">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${accentColor}`} />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${color} shadow-sm`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-black text-gray-900 dark:text-white font-outfit mb-2 group-hover:text-cpsu-green transition-colors flex items-center gap-2">
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
      className="h-full min-w-[240px] sm:min-w-0 snap-center"
    >
      {link ? (
        <Link to={link} className="block h-full cursor-pointer group">{CardContent}</Link>
      ) : (
        <button onClick={onClick} className="block h-full cursor-pointer group w-full">{CardContent}</button>
      )}
    </motion.div>
  );
};

/* ── Main Dashboard ─────────────────────────────────────── */

const StudentDashboard = () => {
  // Existing state
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

  // New state
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('cpsu-dark-mode') === 'true');
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [wellnessHistory, setWellnessHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [sosProgress, setSosProgress] = useState(0);
  const [sosHolding, setSosHolding] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  const sosIntervalRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Dark mode persistence
  useEffect(() => {
    localStorage.setItem('cpsu-dark-mode', darkMode);
  }, [darkMode]);

  // Data fetching
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsCheckingEmergency(true);
    setIsLoadingInsights(true);
    try {
      const [me, unread, activeEmergencies, symptoms, trends, appts, meds, wellness] = await Promise.all([
        authService.getMe(),
        notificationService.getUnreadCount(),
        studentService.getActiveEmergencies(),
        studentService.getSymptomHistory(),
        studentService.getPersonalTrends(),
        appointmentService.getAppointments().catch(() => []),
        studentService.getMedications().catch(() => []),
        wellnessService.getHistory().catch(() => []),
      ]);
      setUser(me);
      setUnreadCount(unread.count);
      const active = Array.isArray(activeEmergencies) && activeEmergencies.length > 0 ? activeEmergencies[0] : null;
      setHasActiveEmergency(!!active);
      setActiveEmergency(active);
      setSymptomHistory(Array.isArray(symptoms) ? symptoms : []);
      setPersonalTrends(trends);
      setAppointments(Array.isArray(appts) ? appts : []);
      setMedications(Array.isArray(meds) ? meds : []);
      setWellnessHistory(Array.isArray(wellness) ? wellness : []);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsCheckingEmergency(false);
      setIsLoadingInsights(false);
    }
  };

  // Geolocation watch for active emergencies
  useEffect(() => {
    if (!hasActiveEmergency || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];
        setUserLocation(coords);
        if (activeEmergency?.id) {
          try {
            await studentService.updateEmergencyLocation(activeEmergency.id, `GPS ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Real-time tracking)`);
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
    if (!navigator.geolocation) return Promise.reject(new Error("Geolocation is not supported by your browser."));
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          resolve(`GPS ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Student Dashboard)`);
        },
        () => reject(new Error("Failed to get current location. Please enable location services.")),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  };

  // Toast helper
  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  // SOS Hold-to-Trigger mechanism
  const startSosHold = () => {
    if (isCheckingEmergency || hasActiveEmergency || isTriggeringEmergency) return;
    setSosHolding(true);
    setSosProgress(0);
    const startTime = Date.now();
    const duration = 2000;
    sosIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setSosProgress(pct);
      if (pct >= 100) {
        clearInterval(sosIntervalRef.current);
        triggerEmergency();
      }
    }, 30);
  };

  const stopSosHold = () => {
    if (sosIntervalRef.current) clearInterval(sosIntervalRef.current);
    setSosHolding(false);
    setSosProgress(0);
  };

  const triggerEmergency = async () => {
    setSosHolding(false);
    setSosProgress(0);
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
      showToast('success', 'Emergency alert sent! Help is on the way. Please stay where you are.');
    } catch (err) {
      console.error("Failed to trigger emergency:", err);
      if (err.message?.includes("Geolocation") || err.message?.includes("location")) {
        showToast('error', err.message);
      } else if (err?.response?.status === 409) {
        setHasActiveEmergency(true);
        showToast('error', 'You already have an active emergency case.');
      } else {
        showToast('error', 'System Error: Could not send alert. Please call campus security.');
      }
    } finally {
      setIsTriggeringEmergency(false);
    }
  };

  // Cleanup refs on unmount
  useEffect(() => {
    return () => {
      if (sosIntervalRef.current) clearInterval(sosIntervalRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // ── Derived data ──
  const latestCheckin = wellnessHistory.length > 0 ? wellnessHistory[0] : null;
  const wellnessScore = computeWellnessScore(latestCheckin);
  const moodTrend = wellnessHistory.slice(0, 7).reverse().map(c => moodToValue(c.mood));
  const todayCheckinDone = wellnessHistory.some(c => isToday(c.created_at));
  const upcomingAppointments = appointments
    .filter(a => new Date(a.scheduled_date || a.date || a.appointment_date) >= new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduled_date || a.date || a.appointment_date) - new Date(b.scheduled_date || b.date || b.appointment_date));
  const nextAppointment = upcomingAppointments[0];
  const activeMeds = medications.filter(m => m.status === 'active' || !m.status);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#fcfcfd] dark:bg-gray-900 p-6 md:p-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* ═══ Header ═══ */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-cpsu-green/10 text-cpsu-green text-[10px] font-black uppercase tracking-widest rounded-full">Student Portal</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white font-outfit tracking-tight flex items-center gap-3">
                <GreetingIcon />
                {getGreeting()},{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cpsu-green to-cpsu-green-light">
                  {user?.name?.split(' ')[0] || 'Student'}
                </span>!
              </h1>
              <p className="text-gray-400 font-bold mt-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                <Sparkles className="w-4 h-4 text-cpsu-gold" />
                Your personalized health dashboard is ready.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm group"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode
                  ? <Sun className="w-6 h-6 text-yellow-400 group-hover:rotate-45 transition-transform" />
                  : <MoonIcon className="w-6 h-6 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                }
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm group hover:border-cpsu-green/20"
              >
                <Bell className="w-7 h-7 text-gray-300 group-hover:text-cpsu-green transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-cpsu-gold text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#fcfcfd] dark:border-gray-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* SOS Button — Hold to trigger */}
              <button
                onMouseDown={startSosHold}
                onMouseUp={stopSosHold}
                onMouseLeave={stopSosHold}
                onTouchStart={startSosHold}
                onTouchEnd={stopSosHold}
                data-tour="sos-button"
                disabled={isCheckingEmergency || hasActiveEmergency || isTriggeringEmergency}
                title={hasActiveEmergency ? "Active emergency case. Wait until resolved." : "Hold for 2 seconds to trigger emergency alert"}
                className={`relative flex items-center gap-3 px-8 py-4 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg group overflow-hidden select-none ${
                  isCheckingEmergency || hasActiveEmergency || isTriggeringEmergency
                    ? 'bg-red-300 cursor-not-allowed shadow-red-100'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                }`}
              >
                {/* Hold progress fill */}
                <div
                  className="absolute inset-0 bg-red-800/60 transition-none pointer-events-none"
                  style={{ width: `${sosProgress}%` }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${sosHolding ? 'sos-shimmer' : 'group-hover:scale-110'} transition-transform`} />
                  {isCheckingEmergency
                    ? 'Checking Status...'
                    : isTriggeringEmergency
                      ? 'Sending Alert...'
                      : hasActiveEmergency
                        ? 'Case Under Review'
                        : sosHolding
                          ? 'Hold to confirm...'
                          : 'Emergency Help'}
                </span>
              </button>
            </motion.div>
          </div>

          {/* ═══ Quick Stats Row ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Assessments" value={symptomHistory.length} icon={Stethoscope} color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" delay={0.05} />
            <StatCard label="Active Meds" value={activeMeds.length} icon={Pill} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" delay={0.1} />
            <StatCard
              label="Last Check-in"
              value={latestCheckin ? new Date(latestCheckin.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
              icon={Calendar}
              color="bg-cpsu-green/10 text-cpsu-green dark:bg-green-900/30 dark:text-green-400"
              delay={0.15}
            />
            <StatCard label="Notifications" value={unreadCount} icon={Bell} color="bg-cpsu-gold/10 text-cpsu-gold dark:bg-yellow-900/30 dark:text-yellow-400" delay={0.2} />
          </div>

          {/* ═══ SOS Map (Active Emergency) ═══ */}
          <AnimatePresence>
            {hasActiveEmergency && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50/50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-800/30 rounded-[2.5rem] p-6 shadow-inner overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">Live SOS Status</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white font-outfit">Medical assistance is on the way</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                      Your real-time location is being shared with clinic staff. Please stay calm and remain at your current position.
                    </p>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-red-50 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-cpsu-green/10 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-cpsu-green" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinic Status</p>
                      </div>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Staff have been alerted and are reviewing your case.</p>
                    </div>
                    <button
                      onClick={() => setFollowUser(true)}
                      className="w-full py-3 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-all"
                    >
                      <div className={`w-2 h-2 rounded-full ${followUser ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      Center My Location
                    </button>
                  </div>
                  <div className={`${mapFullscreen ? 'fixed inset-0 z-[60] rounded-none' : 'md:w-2/3 h-[350px] rounded-3xl'} bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden relative shadow-sm transition-all`}>
                    <button
                      onClick={() => setMapFullscreen(!mapFullscreen)}
                      className="absolute top-3 right-3 z-[10] p-2 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-md hover:scale-105 transition-transform"
                    >
                      {mapFullscreen ? <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                    </button>
                    <MapContainer
                      center={userLocation || CLINIC_COORDS}
                      zoom={17}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={CLINIC_COORDS} icon={clinicIcon}>
                        <Popup><p className="text-xs font-bold">CPSU Clinic</p></Popup>
                      </Marker>
                      {userLocation && (
                        <Marker position={userLocation} icon={userIcon}>
                          <Popup><p className="text-xs font-bold">You are here</p></Popup>
                        </Marker>
                      )}
                      <MapViewportController focusPoint={followUser ? (userLocation || CLINIC_COORDS) : null} />
                    </MapContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ Quick Actions — Horizontal scroll on mobile, grid on desktop ═══ */}
          <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:pb-0 sm:overflow-visible scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
            <div data-tour="wellness-card">
              <ActionCard
                title="Wellness Check" desc="Mind & Body Tracker"
                icon={Heart} onClick={() => setShowWellnessModal(true)}
                color="bg-red-50 text-red-600" accentColor="bg-red-600"
                delay={0.1}
              />
            </div>
            <ActionCard
              title="Symptoms" desc="AI Assessment"
              icon={Activity} link="/student/symptoms"
              color="bg-blue-50 text-blue-600" accentColor="bg-blue-600"
              delay={0.2}
            />
            <ActionCard
              title="AI Health Chat" desc="Virtual Assistant"
              icon={MessageSquare} link="/student/chat"
              color="bg-cpsu-green/10 text-cpsu-green" accentColor="bg-cpsu-green"
              delay={0.3}
            />
            <ActionCard
              title="Medical Logs" desc="Health Records"
              icon={FileText} link="/student/records"
              color="bg-cpsu-gold/10 text-cpsu-gold" accentColor="bg-cpsu-gold"
              delay={0.4}
            />
          </div>

          {/* ═══ Dashboard Content Grid ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Health Insights (2 cols) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="col-span-1 lg:col-span-2"
              data-tour="health-insights"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black font-outfit text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-cpsu-green" />
                    </div>
                    Health Insights
                  </h2>
                  <Link to="/student/medications" className="text-xs font-black uppercase tracking-widest text-cpsu-green hover:text-cpsu-gold transition-colors flex items-center gap-1 group">
                    Pillbox Manager
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="flex-1 flex flex-col items-center justify-start p-6 text-left rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-dashed border-gray-100 dark:border-gray-700 overflow-y-auto max-h-[500px]">
                  {isLoadingInsights ? (
                    /* ── Skeleton Loading ── */
                    <div className="w-full space-y-4">
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                  ) : (
                    <div className="w-full space-y-6">
                      {/* Personal Trends + Sparkline */}
                      {personalTrends && (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-cpsu-green/10 to-transparent border border-cpsu-green/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-cpsu-gold" />
                              <h3 className="text-sm font-black text-cpsu-green uppercase tracking-widest">Your Health Overview</h3>
                            </div>
                            {moodTrend.length >= 2 && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">7-Day Mood</span>
                                <SparklineChart data={moodTrend} width={120} height={36} />
                              </div>
                            )}
                          </div>
                          <p className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-4">{personalTrends.awareness_message}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {personalTrends.general_tips?.map((tip, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-white dark:border-gray-700 shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-cpsu-gold mt-1.5 flex-shrink-0" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Assessments */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Your Recent Assessments</h3>
                        {symptomHistory.length > 0 ? (
                          symptomHistory.slice(0, 3).map((entry) => (
                            <div key={entry.id} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-cpsu-green/30 transition-all">
                              <p className="text-[10px] text-cpsu-green font-black uppercase tracking-widest mb-1">{formatInsightDate(entry.created_at)}</p>
                              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                AI Assessment: {entry.predicted_disease || 'Pending classification'}
                              </h3>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-widest">
                                Symptoms: {Array.isArray(entry.symptoms) && entry.symptoms.length > 0 ? entry.symptoms.join(', ') : 'No symptom details'}
                              </p>
                            </div>
                          ))
                        ) : (
                          /* ── Empty State with Illustration ── */
                          <div className="py-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-center mb-4">
                              <div className="relative">
                                <div className="w-20 h-20 bg-cpsu-green/5 rounded-full flex items-center justify-center">
                                  <Stethoscope className="w-10 h-10 text-cpsu-green/30" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-8 h-8 bg-cpsu-gold/10 rounded-full flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-cpsu-gold/50" />
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wide mb-1">No Health Assessments Yet</p>
                            <p className="text-gray-400 text-xs mb-4 max-w-xs mx-auto">Take your first AI-powered symptom assessment to start tracking your health.</p>
                            <Link
                              to="/student/symptoms"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cpsu-green text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cpsu-green-dark transition-colors shadow-sm"
                            >
                              Start Assessment
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── Sidebar (1 col) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="col-span-1 space-y-6"
            >
              {/* Wellness Score Ring Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Wellness Score</h3>
                <div className="flex items-center gap-6">
                  <WellnessRing score={wellnessScore} />
                  <div className="flex-1 space-y-1">
                    {latestCheckin ? (
                      <>
                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          {latestCheckin.mood} mood
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {latestCheckin.sleep_hours}h sleep · Stress {latestCheckin.stress_level}/10
                        </p>
                        <p className="text-[10px] text-cpsu-green font-bold uppercase tracking-widest">
                          {latestCheckin.physical_activity} activity
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">Complete a wellness check to see your score.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Appointment */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Next Appointment</h3>
                  <Link to="/student/appointments" className="text-[10px] font-black text-cpsu-green uppercase tracking-widest hover:text-cpsu-gold transition-colors">
                    View All
                  </Link>
                </div>
                {nextAppointment ? (
                  <div className="p-4 rounded-2xl bg-cpsu-green/5 dark:bg-cpsu-green/10 border border-cpsu-green/10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-cpsu-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-cpsu-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                        {nextAppointment.reason || nextAppointment.purpose || 'Clinic Visit'}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(nextAppointment.scheduled_date || nextAppointment.date || nextAppointment.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-cpsu-green">
                        {formatCountdown(nextAppointment.scheduled_date || nextAppointment.date || nextAppointment.appointment_date)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 text-center">
                    <p className="text-xs text-gray-400 font-bold">No upcoming appointments</p>
                    <Link to="/student/appointments" className="text-[10px] font-black text-cpsu-green uppercase tracking-widest mt-1 inline-flex items-center gap-1 hover:text-cpsu-gold transition-colors">
                      Book one <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              {/* First Aid Knowledge */}
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

              {/* Dynamic Daily Checklist */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                <h2 className="text-xl font-black font-outfit text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-cpsu-gold" />
                  Daily Checklist
                </h2>
                <div className="space-y-3">
                  {/* Wellness check-in */}
                  <button
                    onClick={() => !todayCheckinDone && setShowWellnessModal(true)}
                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all group cursor-pointer ${
                      todayCheckinDone
                        ? 'bg-cpsu-green/5 dark:bg-cpsu-green/10 border-cpsu-green/20'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-cpsu-green/5 border-gray-100 dark:border-gray-700 hover:border-cpsu-green/10'
                    }`}
                  >
                    <div className={`w-10 h-10 shadow-sm border rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      todayCheckinDone ? 'bg-cpsu-green border-cpsu-green text-white' : 'bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-600 text-cpsu-green'
                    }`}>
                      {todayCheckinDone ? <CheckCircle2 className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Wellness Check</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${todayCheckinDone ? 'text-cpsu-green' : 'text-gray-400'}`}>
                        {todayCheckinDone ? 'Completed Today ✓' : 'Complete Task'}
                      </p>
                    </div>
                    {todayCheckinDone ? (
                      <CheckCircle2 className="w-5 h-5 text-cpsu-green" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600 group-hover:border-cpsu-green transition-colors" />
                    )}
                  </button>

                  {/* Medication reminders */}
                  {activeMeds.slice(0, 2).map((med, idx) => (
                    <Link
                      key={med.id || idx}
                      to="/student/medications"
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 flex items-center gap-4 transition-all group"
                    >
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 shadow-sm border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{med.name || med.medication_name || 'Medication'}</p>
                        <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider opacity-70">{med.dosage || 'Take as prescribed'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors" />
                    </Link>
                  ))}

                  {/* Next appointment reminder */}
                  {nextAppointment && (
                    <Link
                      to="/student/appointments"
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 flex items-center gap-4 transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 shadow-sm border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                          {nextAppointment.reason || nextAppointment.purpose || 'Appointment'}
                        </p>
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider opacity-70">
                          {formatCountdown(nextAppointment.scheduled_date || nextAppointment.date || nextAppointment.appointment_date)} remaining
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ═══ Wellness Modal ═══ */}
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
                  <WellnessCheckin onComplete={() => { setShowWellnessModal(false); fetchData(); }} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══ Toast Notification ═══ */}
        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        {/* ═══ Notification Center ═══ */}
        <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      </div>
    </div>
  );
};

export default StudentDashboard;
