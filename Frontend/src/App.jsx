import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import About from './components/About';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';



import Sidebar from './components/Sidebar';
import SystemTour from './components/SystemTour';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentChat from './pages/student/Chat';
import StudentSymptoms from './pages/student/Symptoms';
import StudentMedications from './pages/student/Medications';
import StudentRecords from './pages/student/Records';
import KnowledgeBase from './pages/student/KnowledgeBase';
import StudentProfile from './pages/student/Profile';
import StudentAppointments from './pages/student/Appointments';
import StudentMessages from './pages/student/Messages';
import Settings from './pages/Settings';

import StaffDashboard from './pages/staff/Dashboard';
import StaffMedicalRecords from './pages/staff/MedicalRecords';
import StaffConsultations from './pages/staff/Consultations';
import StaffInventory from './pages/staff/Inventory';
import StaffReports from './pages/staff/Reports';
import StaffMessages from './pages/staff/Messages';
import EmergencyMap from './pages/staff/EmergencyMap';
import AdminDashboard from './pages/admin/Dashboard';
import HotspotMap from './pages/admin/HotspotMap';

import AlertBanner from './components/AlertBanner';
import InternalHeader from './components/InternalHeader';

const LandingPage = () => (
  <div className="min-h-screen flex flex-col font-sans">
    <Navbar />
    <main className="flex-1">
      <Hero />
      <Features />
      <HowItWorks />
      <About />
      <FAQ />
    </main>
    <Footer />
  </div>
);

import ConsentGate from './components/ConsentGate';
import AuditLogs from './pages/admin/AuditLogs';

import NotificationCenter from './components/NotificationCenter';
import { notificationService, settingsService } from './api/service';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Shared Protected Layout with CPSU Header and Sidebar
const InternalLayout = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const refreshUser = () => {
    try {
      const saved = localStorage.getItem('user');
      const updated = (saved && saved !== 'undefined') ? JSON.parse(saved) : {};
      setUser(updated);
    } catch (e) {
      setUser({});
    }
  };

  const { t } = useLanguage();

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <ConsentGate user={user} onConsent={refreshUser}>
      <div className={`min-h-screen flex bg-gray-50 transition-colors duration-500`}>
        <SystemTour role={user.role || 'student'} />
        <Sidebar role={user.role || 'student'} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <AlertBanner />
          <InternalHeader 
            onNotificationsClick={() => setIsNotificationsOpen(true)} 
            unreadCount={unreadCount}
          />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
        <NotificationCenter 
          isOpen={isNotificationsOpen} 
          onClose={() => {
            setIsNotificationsOpen(false);
            fetchUnreadCount(); // Refresh count when closing
          }} 
        />
      </div>
    </ConsentGate>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />



          {/* Redirect generic /settings to role-specific one */}
          <Route path="/settings" element={<SettingsRedirect />} />

          {/* Protected Routes */}
          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<InternalLayout><StudentDashboard /></InternalLayout>} />
            <Route path="/student/consultations" element={<InternalLayout><StudentRecords /></InternalLayout>} />
            <Route path="/student/chat" element={<InternalLayout><StudentChat /></InternalLayout>} />
            <Route path="/student/symptoms" element={<InternalLayout><StudentSymptoms /></InternalLayout>} />
            <Route path="/student/medications" element={<InternalLayout><StudentMedications /></InternalLayout>} />
            <Route path="/student/records" element={<InternalLayout><StudentRecords /></InternalLayout>} />
            <Route path="/student/knowledge" element={<InternalLayout><KnowledgeBase /></InternalLayout>} />
            <Route path="/student/profile" element={<InternalLayout><StudentProfile /></InternalLayout>} />
            <Route path="/student/appointments" element={<InternalLayout><StudentAppointments /></InternalLayout>} />
            <Route path="/student/messages" element={<InternalLayout><StudentMessages /></InternalLayout>} />
            <Route path="/student/settings" element={<InternalLayout><Settings /></InternalLayout>} />
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path="/staff" element={<InternalLayout><StaffDashboard /></InternalLayout>} />
            <Route path="/staff/records" element={<InternalLayout><StaffMedicalRecords /></InternalLayout>} />
            <Route path="/staff/consultations" element={<InternalLayout><StaffConsultations /></InternalLayout>} />
            <Route path="/staff/inventory" element={<InternalLayout><StaffInventory /></InternalLayout>} />
            <Route path="/staff/appointments" element={<InternalLayout><StudentAppointments /></InternalLayout>} />
            <Route path="/staff/reports" element={<InternalLayout><StaffReports /></InternalLayout>} />
            <Route path="/staff/messages" element={<InternalLayout><StaffMessages /></InternalLayout>} />
            <Route path="/staff/emergency-map" element={<InternalLayout><EmergencyMap /></InternalLayout>} />
            <Route path="/staff/settings" element={<InternalLayout><Settings /></InternalLayout>} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<InternalLayout><AdminDashboard /></InternalLayout>} />
            <Route path="/admin/users" element={<InternalLayout><AdminDashboard /></InternalLayout>} />
            <Route path="/admin/audit" element={<InternalLayout><AuditLogs /></InternalLayout>} />
            <Route path="/admin/map" element={<InternalLayout><HotspotMap /></InternalLayout>} />
            <Route path="/admin/settings" element={<InternalLayout><Settings /></InternalLayout>} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

const SettingsRedirect = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr || userStr === 'undefined') return <Navigate to="/login" />;
  const user = JSON.parse(userStr);
  return <Navigate to={`/${user.role}/settings`} />;
};

export default App;
