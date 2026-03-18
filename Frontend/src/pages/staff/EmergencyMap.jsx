import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  LocateFixed,
  Loader2,
  Navigation,
  RefreshCw,
  Route,
  Crosshair,
} from 'lucide-react';
import { staffService } from '../../api/service';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker asset paths for Vite.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CLINIC_COORDS = [9.851093, 122.888895];
const DEFAULT_ZOOM = 16;
const REFRESH_INTERVAL_MS = 15000;
const MAX_ROUTABLE_DISTANCE_KM = 80;

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

const emergencyIcon = new L.DivIcon({
  className: 'custom-emergency-marker',
  html: '<div style="width:16px;height:16px;background:#ef4444;border:3px solid #fff;border-radius:9999px;box-shadow:0 0 0 4px rgba(239,68,68,0.25)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
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

const parseGpsFromLocationText = (locationText = '') => {
  // Matches: "GPS 10.123456, 122.123456 (Student Dashboard)"
  const gpsMatch = locationText.match(/GPS\s+(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
  if (!gpsMatch) {
    return null;
  }

  const lat = Number.parseFloat(gpsMatch[1]);
  const lng = Number.parseFloat(gpsMatch[2]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return [lat, lng];
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const distanceKmBetween = (a, b) => {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;

  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
};

const isNearCampus = (coords) => distanceKmBetween(CLINIC_COORDS, coords) <= MAX_ROUTABLE_DISTANCE_KM;

const shouldAttemptGeocode = (query = '') => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const knownInvalidPhrases = [
    'location unavailable',
    'student dashboard',
    'sos',
    'unknown',
    'n/a',
  ];

  const containsInvalidPhrase = knownInvalidPhrases.some((phrase) => normalized.includes(phrase));
  if (containsInvalidPhrase) {
    return false;
  }

  return normalized.length >= 6;
};

const geocodeWithNominatim = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to geocode emergency location');
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const first = payload[0];
  const lat = Number.parseFloat(first.lat);
  const lng = Number.parseFloat(first.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const coords = [lat, lng];
  return isNearCampus(coords) ? coords : null;
};

const fetchRouteFromOsrm = async (start, end) => {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  if (!isNearCampus(end)) {
    throw new Error('Destination is outside supported campus routing range');
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

  const response = await fetch(url);

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const osrmMessage = payload?.message || 'OSRM request failed';
    throw new Error(osrmMessage);
  }

  const route = payload?.routes?.[0];

  if (!route?.geometry?.coordinates) {
    throw new Error('No route available for this destination');
  }

  const latLngPath = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    path: latLngPath,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
};

const MapViewportController = ({ focusPoint }) => {
  const map = useMap();

  useEffect(() => {
    if (!focusPoint) {
      return;
    }

    map.flyTo(focusPoint, 18, { duration: 0.8 });
  }, [focusPoint, map]);

  return null;
};

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) {
    return 'N/A';
  }

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }

  return `${Math.round(meters)} m`;
};

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) {
    return 'N/A';
  }

  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min`;
  }

  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours}h ${rem}m`;
};

const EmergencyMap = () => {
  const [loading, setLoading] = useState(true);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState('');
  const [routeError, setRouteError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeMeta, setRouteMeta] = useState({ distanceMeters: null, durationSeconds: null });
  const [userLocation, setUserLocation] = useState(null);
  const [followUser, setFollowUser] = useState(false);

  const selectedAlert = useMemo(
    () => alerts.find((alert) => alert.id === selectedAlertId) || null,
    [alerts, selectedAlertId]
  );

  const fetchActiveAlerts = useCallback(async () => {
    try {
      const emergencyList = await staffService.getActiveEmergencies();

      const enriched = await Promise.all(
        emergencyList.map(async (alert) => {
          const parsedGps = parseGpsFromLocationText(alert.location);
          if (parsedGps) {
            const outOfRange = !isNearCampus(parsedGps);
            return {
              ...alert,
              coordinates: parsedGps,
              isOutOfRange: outOfRange
            };
          }

          // Fallback: attempt geocoding for non-GPS location strings.
          if (!shouldAttemptGeocode(alert.location)) {
            return { ...alert, coordinates: null, isOutOfRange: false };
          }

          try {
            const guessed = await geocodeWithNominatim(alert.location);
            const outOfRange = guessed ? !isNearCampus(guessed) : false;
            return { ...alert, coordinates: guessed, isOutOfRange };
          } catch {
            return { ...alert, coordinates: null, isOutOfRange: false };
          }
        })
      );

      setAlerts(enriched);
      setError('');

      if (enriched.length === 0) {
        setSelectedAlertId(null);
        setRoutePath([]);
        setRouteMeta({ distanceMeters: null, durationSeconds: null });
        return;
      }

      setSelectedAlertId((currentId) => {
        const stillExists = enriched.some((entry) => entry.id === currentId);
        return stillExists ? currentId : enriched[0].id;
      });
    } catch (err) {
      console.error('Failed to fetch emergency alerts', err);
      setError('Unable to load active emergency alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveAlerts();
    const timer = window.setInterval(fetchActiveAlerts, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [fetchActiveAlerts]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleRouteToAlert = useCallback(
    async (alert) => {
      setFollowUser(false);
      if (!alert?.coordinates) {
        setRouteError('No coordinates available for this emergency location.');
        setRoutePath([]);
        setRouteMeta({ distanceMeters: null, durationSeconds: null });
        return;
      }

      setRouteError('');
      setLoadingRoute(true);
      setSelectedAlertId(alert.id);

      try {
        const startPoint = userLocation || CLINIC_COORDS;
        const route = await fetchRouteFromOsrm(startPoint, alert.coordinates);
        setRoutePath(route.path);
        setRouteMeta({
          distanceMeters: route.distanceMeters,
          durationSeconds: route.durationSeconds,
        });
      } catch (err) {
        console.error('Failed to fetch route', err);
        setRouteError(err?.message || 'Route unavailable from OSRM for this alert right now.');
        setRoutePath([]);
        setRouteMeta({ distanceMeters: null, durationSeconds: null });
      } finally {
        setLoadingRoute(false);
      }
    },
    []
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">
              Emergency Navigation
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">Live Emergency Map</h1>
          <p className="text-gray-500 mt-2 text-sm font-bold uppercase tracking-wider">
            Active alert markers and OSRM route from clinic to patient location.
          </p>
        </div>

        <button
          onClick={fetchActiveAlerts}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {(error || routeError) && (
        <div className="space-y-3">
          {error ? (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold">
              {error}
            </div>
          ) : null}
          {routeError ? (
            <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-semibold">
              {routeError}
            </div>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-white rounded-[2rem] border border-gray-100 p-4 shadow-sm h-[620px]"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center flex-col gap-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-cpsu-green" />
              <p className="font-semibold">Loading live emergencies...</p>
            </div>
          ) : (
            <MapContainer
              center={CLINIC_COORDS}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%', borderRadius: '1.25rem' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <Marker position={CLINIC_COORDS} icon={clinicIcon}>
                <Popup>
                  <div className="text-xs font-semibold">
                    <p className="font-black text-gray-900">CPSU Clinic (Start)</p>
                    <p className="text-gray-600 mt-1">Routing starts from this point.</p>
                  </div>
                </Popup>
              </Marker>

              {alerts
                .filter((alert) => Array.isArray(alert.coordinates) && alert.coordinates.length === 2)
                .map((alert) => (
                  <Marker
                    key={alert.id}
                    position={alert.coordinates}
                    icon={emergencyIcon}
                    eventHandlers={{
                      click: () => {
                        setFollowUser(false);
                        setSelectedAlertId(alert.id);
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-xs font-semibold min-w-56">
                        <p className="font-black text-red-600 mb-1">Emergency Alert</p>
                        <p className="text-gray-700">{alert.location}</p>
                        <p className="text-gray-500 mt-1">{alert.description || 'No additional description'}</p>
                        <button
                          onClick={() => handleRouteToAlert(alert)}
                          className="mt-3 px-3 py-2 w-full bg-red-600 text-white rounded-lg font-black uppercase tracking-widest text-[10px]"
                        >
                          Route Here
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {routePath.length > 0 ? (
                <Polyline positions={routePath} pathOptions={{ color: '#16a34a', weight: 5 }} />
              ) : null}

              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div className="text-xs font-semibold">
                      <p className="font-black text-blue-600">Your Current Location</p>
                      <p className="text-gray-600 mt-1">Updates in real-time.</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              <div className="leaflet-top leaflet-right" style={{ marginTop: '80px', marginRight: '10px' }}>
                <div className="leaflet-control leaflet-bar">
                  <button
                    onClick={() => {
                      setFollowUser(true);
                      if (userLocation) setSelectedAlertId(null);
                    }}
                    className="bg-white hover:bg-gray-50 border-none p-2 rounded-lg shadow-md transition-colors block"
                    title="Locate Me"
                  >
                    <Crosshair className={`w-5 h-5 ${followUser ? 'text-blue-500' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              <MapViewportController focusPoint={followUser ? userLocation : (selectedAlert?.coordinates || CLINIC_COORDS)} />
            </MapContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm h-[620px] overflow-y-auto"
        >
          <div className="mb-5 pb-5 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900 font-outfit">Active Alerts</h2>
            <p className="text-[10px] mt-1 text-gray-400 uppercase tracking-[0.2em] font-black">
              Auto-refresh every 15 seconds
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl p-4 bg-red-50 border border-red-100">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Active</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{alerts.length}</p>
            </div>
            <div className="rounded-2xl p-4 bg-green-50 border border-green-100">
              <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Route ETA</p>
              <p className="text-sm font-black text-gray-900 mt-2">{formatDuration(routeMeta.durationSeconds)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="py-10 px-4 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500">No active emergencies right now.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isSelected = selectedAlertId === alert.id;
                const hasCoords = Array.isArray(alert.coordinates) && alert.coordinates.length === 2;

                return (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isSelected ? 'border-cpsu-green bg-green-50/40' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-gray-900 leading-tight">{alert.location}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {alert.description || 'No details provided'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFollowUser(false);
                          setSelectedAlertId(alert.id);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50"
                      >
                        <LocateFixed className="w-3.5 h-3.5" />
                        Focus
                      </button>

                      <button
                        onClick={() => handleRouteToAlert(alert)}
                        disabled={!hasCoords || alert.isOutOfRange || loadingRoute}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          !hasCoords || alert.isOutOfRange || loadingRoute
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-cpsu-green text-white hover:bg-cpsu-green-dark'
                        }`}
                      >
                        {loadingRoute && isSelected ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5" />
                        )}
                        Route
                      </button>
                    </div>

                    {alert.isOutOfRange ? (
                      <p className="mt-2 text-[10px] text-red-600 font-bold uppercase tracking-wider">
                        Location out of range (&gt;80km from campus).
                      </p>
                    ) : !hasCoords ? (
                      <p className="mt-2 text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                        Missing GPS data for this alert.
                      </p>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <Route className="w-4 h-4 text-cpsu-green" />
              Distance: <span className="font-black text-gray-800">{formatDistance(routeMeta.distanceMeters)}</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Directions powered by OSRM public routing service
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmergencyMap;
