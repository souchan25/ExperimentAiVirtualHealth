import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  ClipboardDocumentListIcon, 
  BeakerIcon, 
  UserCircleIcon, 
  CalendarIcon, 
  EnvelopeIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapIcon,
  Cog6ToothIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../LanguageContext';

const Sidebar = ({ role, isOpen, setIsOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const { t } = useLanguage();

  const studentLinks = [
    { name: t('dashboard'), path: '/student', icon: HomeIcon },
    { name: t('ai_assistant'), path: '/student/chat', icon: ChatBubbleLeftRightIcon },
    { name: t('symptoms'), path: '/student/symptoms', icon: ClipboardDocumentListIcon },
    { name: t('pillbox'), path: '/student/medications', icon: BeakerIcon },
    { name: t('records'), path: '/student/records', icon: ClipboardDocumentListIcon },
    { name: t('appointments'), path: '/student/appointments', icon: CalendarIcon },
    { name: t('messages'), path: '/student/messages', icon: EnvelopeIcon },
    { name: t('profile'), path: '/student/profile', icon: UserCircleIcon },
    { name: t('first_aid'), path: '/student/knowledge', icon: ShieldCheckIcon },
    { name: t('user_guide') || 'User Guide', path: '/student/guide', icon: BookOpenIcon },
    { name: t('settings'), path: '/student/settings', icon: Cog6ToothIcon },
  ];

  const staffLinks = [
    { name: t('dashboard'), path: '/staff', icon: HomeIcon },
    { name: t('consultations'), path: '/staff/consultations', icon: ClipboardDocumentListIcon },
    { name: t('medical_records'), path: '/staff/records', icon: ClipboardDocumentListIcon },
    { name: t('emergency_map'), path: '/staff/emergency-map', icon: MapIcon },
    { name: t('inventory'), path: '/staff/inventory', icon: BeakerIcon },
    { name: t('appointments'), path: '/staff/appointments', icon: CalendarIcon },
    { name: t('reports'), path: '/staff/reports', icon: ChartBarIcon },
    { name: t('messages'), path: '/staff/messages', icon: EnvelopeIcon },
    { name: t('user_guide') || 'User Guide', path: '/staff/guide', icon: BookOpenIcon },
    { name: t('settings'), path: '/staff/settings', icon: Cog6ToothIcon },
  ];

  const adminLinks = [
    { name: t('dashboard'), path: '/admin', icon: HomeIcon },
    { name: t('user_management'), path: '/admin/users', icon: UserCircleIcon },
    { name: t('hotspot_map'), path: '/admin/map', icon: MapIcon },
    { name: t('settings'), path: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : studentLinks;

  return (
    <div 
      data-tour="sidebar"
      className={`bg-white border-r border-gray-100 transition-all duration-500 ease-in-out flex flex-col fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isCollapsed ? 'lg:w-20 w-64' : 'w-64'
      } h-screen shadow-2xl lg:shadow-lg`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-gradient-to-r from-white to-gray-50/50">
        <div className={`flex flex-col transition-opacity duration-300 ${isCollapsed ? 'lg:hidden' : 'opacity-100'}`}>
          <span className="font-black text-cpsu-green text-sm uppercase tracking-tighter">CPSU Portal</span>
          <span className="font-bold text-gray-800 text-xs capitalize leading-none">
            {role === 'student' ? 'Student Dashboard' : `${role} Dashboard`}
          </span>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          data-tour="sidebar-toggle"
          className={`p-2 rounded-xl transition-all duration-300 hidden lg:block ${
            isCollapsed 
              ? 'mx-auto bg-cpsu-green/10 text-cpsu-green hover:bg-cpsu-green hover:text-white' 
              : 'bg-gray-100 text-gray-500 hover:bg-cpsu-gold hover:text-white'
          }`}
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 -mr-2 text-gray-500 hover:text-red-500 lg:hidden"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              title={isCollapsed ? link.name : ''}
              className={`flex items-center rounded-xl transition-all duration-300 group ${
                isCollapsed ? 'justify-center p-3' : 'p-3 px-4'
              } ${
                isActive 
                  ? 'bg-cpsu-green text-white shadow-md shadow-cpsu-green/20 scale-[1.02]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-cpsu-green'
              }`}
            >
              <link.icon className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                isActive ? 'text-cpsu-gold' : 'text-gray-400 group-hover:text-cpsu-green'
              }`} />
              {!isCollapsed && (
                <span className={`ml-3 font-bold text-sm tracking-wide ${isActive ? 'text-white' : ''}`}>
                  {link.name}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cpsu-gold shadow-sm shadow-cpsu-gold/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t border-gray-50 bg-gray-50/30 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center transition-all duration-500 ${isCollapsed ? 'flex-col' : 'px-2'}`}>
          <div className={`relative group`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-md transition-transform group-hover:rotate-6 ${
              role === 'student' ? 'bg-cpsu-green shadow-cpsu-green/30' : 'bg-cpsu-gold shadow-cpsu-gold/30'
            }`}>
              {role[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-gray-50 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{role}</p>
              <p className="text-[10px] font-bold text-cpsu-green uppercase tracking-widest opacity-70">CPSU PATIENT</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
