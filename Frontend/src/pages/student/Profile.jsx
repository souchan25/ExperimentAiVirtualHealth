import React, { useState, useEffect } from 'react';
import { profileService } from '../../api/service';
import { UserCircleIcon, PhoneIcon, UserIcon, BeakerIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    age: '',
    sex: '',
    blood_type: '',
    allergies: '',
    pre_existing_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    cpsu_address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile({
        age: data.age || '',
        sex: data.sex || '',
        blood_type: data.blood_type || '',
        allergies: data.allergies || '',
        pre_existing_conditions: data.pre_existing_conditions || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        cpsu_address: data.cpsu_address || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Sanitize data before sending to API
      const sanitizedProfile = {
        ...profile,
        age: profile.age !== '' && profile.age !== null ? parseInt(profile.age, 10) : null,
        sex: profile.sex || null,
        blood_type: profile.blood_type || null,
      };
      await profileService.updateProfile(sanitizedProfile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Profile</h1>
          <p className="text-gray-500 mt-1">Keep your medical information up to date for better care.</p>
        </div>
        <UserCircleIcon className="w-16 h-16 text-green-600" />
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-green-600" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input 
                type="number" 
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={profile.age}
                onChange={(e) => setProfile({...profile, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
              <select 
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={profile.sex}
                onChange={(e) => setProfile({...profile, sex: e.target.value})}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
              <select 
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={profile.blood_type}
                onChange={(e) => setProfile({...profile, blood_type: e.target.value})}
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
            <input 
              type="text" 
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. Brgy. 1, Kabankalan City"
              value={profile.cpsu_address}
              onChange={(e) => setProfile({...profile, cpsu_address: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2 text-green-600" />
            Medical History
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (Medicines, Food, etc.)</label>
              <textarea 
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none h-24"
                placeholder="e.g. Penicillin, Peanuts"
                value={profile.allergies}
                onChange={(e) => setProfile({...profile, allergies: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pre-existing Conditions</label>
              <textarea 
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none h-24"
                placeholder="e.g. Asthma, Hypertension"
                value={profile.pre_existing_conditions}
                onChange={(e) => setProfile({...profile, pre_existing_conditions: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <PhoneIcon className="w-5 h-5 mr-2 text-green-600" />
            Emergency Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input 
                type="text" 
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={profile.emergency_contact_name}
                onChange={(e) => setProfile({...profile, emergency_contact_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input 
                type="text" 
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={profile.emergency_contact_phone}
                onChange={(e) => setProfile({...profile, emergency_contact_phone: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100'
            }`}
          >
            {saving ? 'Saving...' : 'Save Health Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
