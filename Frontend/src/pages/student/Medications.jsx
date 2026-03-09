import React, { useState, useEffect } from 'react';
import { Pill, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentService } from '../../api/service';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const data = await studentService.getMedications();
        setMedications(data);
      } catch (err) {
        console.error("Failed to load medications", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/student" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-outfit">My Medications</h1>
            <p className="text-gray-500 mt-1">Track prescriptions authorized by the clinic.</p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cpsu-green"></div>
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Pill className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-outfit">No Active Prescriptions</h3>
            <p className="text-gray-500 max-w-sm mx-auto">You do not have any active medications prescribed by the campus clinic.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medications.map(med => (
              <div key={med.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                      <Pill className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 font-outfit">{med.name}</h3>
                      <p className="text-sm text-gray-500">{med.dosage} - {med.frequency}</p>
                    </div>
                  </div>
                  {med.is_active ? (
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                      Completed
                    </span>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                  <p className="text-sm text-gray-600 mb-1"><span className="font-semibold text-gray-900">Instructions:</span> {med.instructions}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Duration:</span> {med.start_date} to {med.end_date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Medications;
