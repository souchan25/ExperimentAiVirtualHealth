import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  PaintBrushIcon, 
  KeyIcon,
  UserIcon,
  PhoneIcon,
  BeakerIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { settingsService, profileService } from '../api/service';
import { useLanguage } from '../LanguageContext';

const Settings = () => {
  const { t, updateLanguage, updateTheme } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [role, setRole] = useState('');

  // Form States
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    language: 'en'
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [userBasicInfo, setUserBasicInfo] = useState({
    school_id: '',
    name: '',
    department: '',
    email: ''
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setRole(savedUser.role || 'student');
    setUserBasicInfo({
      school_id: savedUser.school_id || '',
      name: savedUser.name || '',
      department: savedUser.department || '',
      email: savedUser.email || ''
    });
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const settingsData = await settingsService.getSettings();
      setSettings(settingsData);
      
      // Update global context
      updateLanguage(settingsData.language || 'en');

      if (role === 'student') {
        const profileData = await profileService.getProfile();
        setHealthProfile(profileData);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSettingsUpdate = async (updatedFields) => {
    // Optimistic Update
    if (updatedFields.language) {
      updateLanguage(updatedFields.language);
      setSettings(prev => ({ ...prev, language: updatedFields.language }));
    }

    setSaving(true);
    try {
      const response = await settingsService.updateSettings(updatedFields);
      setSettings(response);
      showMessage('success', t('save_success') || 'Settings updated successfully');
    } catch (err) {
      // Revert if failed? Or just show error. For theme/lang, better to show error.
      showMessage('error', t('save_error') || 'Failed to update settings');
      // Refetch data to ensure sync if error
      fetchData();
    } finally {
      setSaving(false);
    }
  };


  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage('error', t('passwords_no_match') || 'Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await settingsService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      showMessage('success', t('password_changed') || 'Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showMessage('error', err.response?.data?.detail || t('password_change_failed') || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: t('account'), icon: UserCircleIcon },
    { id: 'notifications', name: t('notifications'), icon: BellIcon },
    { id: 'security', name: t('security'), icon: KeyIcon },
    { id: 'language', name: t('language'), icon: PaintBrushIcon },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cpsu-green"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('settings')}</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('settings_subtitle') || 'Manage your account preferences and system configuration.'}</p>
      </div>

      {message.text && (
        <div className={`fixed top-24 right-8 z-50 p-4 rounded-2xl shadow-xl flex items-center transition-all duration-500 ${
          message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircleIcon className="w-6 h-6 mr-3" /> : <ExclamationCircleIcon className="w-6 h-6 mr-3" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-2">
          {tabs.filter(t => !t.hidden).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-cpsu-green text-white shadow-lg shadow-cpsu-green/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-cpsu-green'
              }`}
            >
              <tab.icon className={`w-6 h-6 mr-3 ${activeTab === tab.id ? 'text-cpsu-gold' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          
          {/* Account/Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center uppercase tracking-tight">
                  <UserIcon className="w-6 h-6 mr-2 text-cpsu-green" />
                  {t('account_info') || 'Account Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('school_id') || 'School ID'}</label>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                      value={userBasicInfo.school_id}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('full_name') || 'Full Name'}</label>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                      value={userBasicInfo.name}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('department_label') || 'Department'}</label>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                      value={userBasicInfo.department}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('email_address') || 'Email Address'}</label>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white"
                      value={userBasicInfo.email || 'Not set'}
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500 font-medium italic">{t('account_notice') || 'Contact the CPSU Registrar to update your official account information.'}</p>
              </section>
            </div>
          )}


          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center uppercase tracking-tight">
                  <BellIcon className="w-6 h-6 mr-2 text-cpsu-green" />
                  {t('notification_preferences') || 'Notification Preferences'}
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-white">{t('email_notifications') || 'Email Notifications'}</h3>
                      <p className="text-sm text-gray-500 font-medium">{t('email_notifications_desc') || 'Receive health reports and appointment reminders via email.'}</p>
                    </div>
                    <button 
                      onClick={() => handleSettingsUpdate({ email_notifications: !settings.email_notifications })}
                      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${settings.email_notifications ? 'bg-cpsu-green' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.email_notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-white">{t('push_notifications') || 'Push Notifications'}</h3>
                      <p className="text-sm text-gray-500 font-medium">{t('push_notifications_desc') || 'Get real-time alerts for messages and SOS incidents.'}</p>
                    </div>
                    <button 
                      onClick={() => handleSettingsUpdate({ push_notifications: !settings.push_notifications })}
                      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${settings.push_notifications ? 'bg-cpsu-green' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.push_notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center uppercase tracking-tight">
                  <KeyIcon className="w-6 h-6 mr-2 text-cpsu-green" />
                  {t('security_settings') || 'Security Settings'}
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('current_password') || 'Current Password'}</label>
                    <input 
                      type="password" 
                      required
                      className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 font-bold outline-none focus:ring-2 focus:ring-cpsu-green transition-all dark:text-white text-gray-900"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('new_password') || 'New Password'}</label>
                    <input 
                      type="password" 
                      required
                      className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 font-bold outline-none focus:ring-2 focus:ring-cpsu-green transition-all dark:text-white text-gray-900"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('confirm_password') || 'Confirm New Password'}</label>
                    <input 
                      type="password" 
                      required
                      className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 font-bold outline-none focus:ring-2 focus:ring-cpsu-green transition-all dark:text-white text-gray-900"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-10 py-4 bg-cpsu-green text-white font-black rounded-2xl shadow-xl shadow-cpsu-green/30 hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {saving ? 'CHANGING...' : t('change_password') || 'CHANGE PASSWORD'}
                </button>
              </div>
            </form>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center uppercase tracking-tight">
                  <PaintBrushIcon className="w-6 h-6 mr-2 text-cpsu-green" />
                  {t('language_preferences') || 'Language Preferences'}
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('language')}</label>
                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={() => handleSettingsUpdate({ language: 'en' })}
                        className={`p-4 rounded-2xl border-2 transition-all font-bold ${
                          settings.language === 'en' 
                            ? 'border-cpsu-green bg-cpsu-green/5 text-cpsu-green' 
                            : 'border-gray-100 dark:border-gray-800 text-gray-500'
                        }`}
                      >
                        {t('english')}
                      </button>
                      <button 
                        onClick={() => handleSettingsUpdate({ language: 'fil' })}
                        className={`p-4 rounded-2xl border-2 transition-all font-bold ${
                          settings.language === 'fil' 
                            ? 'border-cpsu-green bg-cpsu-green/5 text-cpsu-green' 
                            : 'border-gray-100 dark:border-gray-800 text-gray-500'
                        }`}
                      >
                        {t('filipino')}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
