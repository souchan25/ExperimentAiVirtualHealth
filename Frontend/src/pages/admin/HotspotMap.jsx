import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, Info, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { reportService } from '../../api/service';

// Mock coordinates for CPSU departments/buildings
const DEPARTMENT_COORDINATES = {
  "College of Engineering": [10.015, 122.845],
  "College of Education": [10.016, 122.846],
  "College of Arts and Sciences": [10.014, 122.844],
  "College of Agriculture": [10.017, 122.847],
  "College of Computer Studies": [10.0155, 122.8455],
  "College of Business and Accountancy": [10.0145, 122.8435],
  "College of Criminal Justice Education": [10.0135, 122.8425],
  "Default": [10.015, 122.845] // Center of campus
};

const HotspotMap = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await reportService.getHealthAudit();
        setData(stats);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
        setError("Could not load health statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSeverityColor = (percentage) => {
    if (percentage > 15) return '#ef4444'; // Red
    if (percentage > 5) return '#f59e0b'; // Gold
    return '#10b981'; // CPSU Green
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cpsu-green animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 font-outfit">Initializing Map Engine...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-cpsu-gold/10 text-cpsu-gold text-[10px] font-black uppercase tracking-widest rounded-full">Admin Intelligence</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cpsu-gold animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-outfit tracking-tight">
              Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-cpsu-green to-cpsu-green-light">Hotspots</span>
            </h1>
            <p className="text-gray-400 font-bold mt-2 flex items-center gap-2 uppercase text-xs tracking-widest">
              <MapPin className="w-4 h-4 text-cpsu-gold" />
              Real-time campus illness distribution.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm relative overflow-hidden h-[600px]"
        >
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{error}</h3>
              <p className="text-gray-400">Please contact technical support if this persists.</p>
            </div>
          ) : (
            <MapContainer 
              center={DEPARTMENT_COORDINATES["Default"]} 
              zoom={16} 
              style={{ height: '100%', width: '100%', borderRadius: '1.5rem', zIndex: 0 }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {data?.department_stats?.map((dept, idx) => {
                const coords = DEPARTMENT_COORDINATES[dept.department] || DEPARTMENT_COORDINATES["Default"];
                const color = getSeverityColor(dept.percentage_with_symptoms);
                return (
                  <Circle
                    key={idx}
                    center={coords}
                    radius={50 + (dept.students_with_symptoms * 5)}
                    pathOptions={{ 
                      color: color, 
                      fillColor: color, 
                      fillOpacity: 0.4,
                      weight: 2
                    }}
                  >
                    <Popup className="font-outfit">
                      <div className="p-2">
                        <h4 className="font-black text-gray-900 mb-1">{dept.department}</h4>
                        <div className="flex justify-between items-center gap-4 text-xs">
                          <span className="text-gray-500 font-bold">SYMPTOMS:</span>
                          <span className="font-black text-cpsu-green">{dept.students_with_symptoms} Students</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 text-xs mt-1">
                          <span className="text-gray-500 font-bold">RISK:</span>
                          <span className="font-black" style={{ color: color }}>
                            {dept.percentage_with_symptoms}%
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </MapContainer>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="text-cpsu-green font-black text-3xl mb-1">
              {data?.department_stats?.filter(d => d.percentage_with_symptoms > 15).length || 0}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">High Risk Zones</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="text-cpsu-gold font-black text-3xl mb-1">{data?.total_records || 0}</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Reports</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="text-blue-500 font-black text-3xl mb-1">
              {data?.triage_breakdown?.Emergency || 0}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Emergencies</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="text-cpsu-green font-black text-3xl mb-1">LIVE</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-black font-outfit text-gray-900 flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-cpsu-green" />
              Legend
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-gray-500 uppercase">Critical ({'>'}15% Symptoms)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cpsu-gold" />
                <span className="text-xs font-bold text-gray-500 uppercase">Moderate (5-15% Symptoms)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cpsu-green" />
                <span className="text-xs font-bold text-gray-500 uppercase">Low ({'<'}5% Symptoms)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-black font-outfit text-gray-900 flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-cpsu-gold" />
              Insights
            </h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              This map visualizes health data aggregated from anonymized symptom reports. Each circle represents a department/college. The size represents the volume of reports, while the color indicates the current risk level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotMap;
