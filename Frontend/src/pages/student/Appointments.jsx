import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../api/service';
import { CalendarIcon, ClockIcon, PlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    scheduled_date: '',
    scheduled_time: '',
    purpose: '',
    notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await appointmentService.createAppointment(newAppt);
      setShowModal(false);
      fetchAppointments();
      setNewAppt({ scheduled_date: '', scheduled_time: '', purpose: '', notes: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your visits to the CPSU Health Clinic.</p>
        </div>
        {isStudent && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Book New
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-gray-100">
          <CalendarIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">No appointments found</h3>
          <p className="text-gray-500">You don't have any scheduled visits yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {appt.status.toUpperCase()}
                </div>
                <div className="text-gray-400 text-sm">
                  #{appt.id.slice(0, 8)}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{appt.purpose}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-600 text-sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {new Date(appt.scheduled_date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {appt.scheduled_time}
                </div>
              </div>

              {!isStudent && appt.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(appt.id, 'confirmed')}
                    className="flex-1 py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => updateStatus(appt.id, 'cancelled')}
                    className="flex-1 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {isStudent && appt.status === 'pending' && (
                <button 
                  onClick={() => updateStatus(appt.id, 'cancelled')}
                  className="w-full py-2 bg-gray-50 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel Request
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Appointment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                  value={newAppt.scheduled_date}
                  onChange={(e) => setNewAppt({...newAppt, scheduled_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <input 
                  type="time" 
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                  value={newAppt.scheduled_time}
                  onChange={(e) => setNewAppt({...newAppt, scheduled_time: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose/Reason</label>
                <select 
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                  value={newAppt.purpose}
                  onChange={(e) => setNewAppt({...newAppt, purpose: e.target.value})}
                >
                  <option value="">Select Purpose</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Symptom Consultation">Symptom Consultation</option>
                  <option value="Medical Clearance">Medical Clearance</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none h-24"
                  value={newAppt.notes}
                  onChange={(e) => setNewAppt({...newAppt, notes: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
