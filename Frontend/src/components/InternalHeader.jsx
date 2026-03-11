import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, Home, BookOpen, FileText, Pill, Activity, MessageSquareIcon } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const InternalHeader = ({ onNotificationsClick, unreadCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const token = localStorage.getItem('token');
  let role = 'student';
  try {
    if (token && token.includes('.')) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role || 'student';
    }
  } catch (e) {
    console.error("Error parsing token role", e);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <Link to={role === 'student' ? '/student' : role === 'staff' ? '/staff' : '/admin'} data-tour="branding" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 bg-white border border-gray-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:rotate-3 transition-all overflow-hidden p-2">
                <img src="/cpsu-logo.png" alt="CPSU" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cpsu-gold rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-cpsu-green uppercase tracking-[0.2em] leading-none mb-1">Negros Occidental</p>
              <p className="text-xl font-black text-gray-900 font-outfit leading-tight tracking-tighter">
                CPSU <span className="text-cpsu-green">Health</span>
              </p>
            </div>
          </Link>

          {/* Right Action Area */}
          <div className="flex items-center gap-4">
            {onNotificationsClick && (
              <button
                onClick={onNotificationsClick}
                data-tour="notifications"
                className="relative p-3 text-gray-400 hover:text-cpsu-green hover:bg-cpsu-green/5 rounded-2xl transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-cpsu-gold text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            
            <div className="h-8 w-[1px] bg-gray-100 mx-2" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 rounded-2xl transition-all border border-red-50 hover:border-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">{t('sign_out')}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default InternalHeader;
