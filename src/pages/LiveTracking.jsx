import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft, Bus, Navigation, Gauge, Clock, MapPin,
  CheckCircle2, AlertTriangle, Play, FastForward, RotateCcw,
  RefreshCw, ShieldAlert, Radio, Compass, Flag, AlertCircle
} from 'lucide-react';
import { getTripTracking, simulateTripAction } from '../api/tracking';
import Navbar from '../components/Navbar';
import Toast from './Toast';

const statusConfig = {
  in_transit: {
    label: 'In Transit — En Route',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    pulse: true,
  },
  delayed: {
    label: 'Delayed due to Traffic',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    pulse: true,
  },
  boarding: {
    label: 'Boarding Passengers',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    pulse: true,
  },
  scheduled: {
    label: 'Trip Scheduled — At Origin',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    pulse: false,
  },
  completed: {
    label: 'Arrived at Destination',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    pulse: false,
  },
};

const LiveTracking = () => {
  const { bookingRef, scheduleId } = useParams();
  const identifier = bookingRef || scheduleId;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isAutoPolling, setIsAutoPolling] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSimulator, setShowSimulator] = useState(true);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Load telemetry data
  const fetchTelemetry = async (silent = false) => {
    try {
      const res = await getTripTracking(identifier);
      setTrip(res.data.data);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch trip tracking data';
      if (!silent) setError(msg);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getTripTracking(identifier)
      .then((res) => {
        if (!ignore) {
          setTrip(res.data.data);
          setError('');
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch trip tracking data');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [identifier]);

  // Periodic polling every 4 seconds when trip is active
  useEffect(() => {
    if (!isAutoPolling || !trip) return;
    if (trip.trip_status === 'completed') return;

    const interval = setInterval(() => {
      fetchTelemetry(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPolling, trip?.trip_status, identifier]);

  // Leaflet Map Initialization & Updates
  useEffect(() => {
    if (!trip || !mapRef.current) return;

    const originLat = trip.origin_coords?.lat || trip.current_latitude;
    const originLng = trip.origin_coords?.lng || trip.current_longitude;

    if (!mapInstanceRef.current) {
      // Initialize map instance
      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([originLat, originLng], 9);

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    group.clearLayers();

    // 1. Draw Polyline Waypoints
    if (trip.waypoints && trip.waypoints.length > 0) {
      const latLngs = trip.waypoints.map(wp => [wp.lat, wp.lng]);
      if (polylineRef.current) {
        polylineRef.current.remove();
      }
      polylineRef.current = L.polyline(latLngs, {
        color: '#4f46e5',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Fit bounds nicely with padding
      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    }

    // 2. Draw Origin Marker (Green Pin)
    if (trip.origin_coords) {
      const originIcon = L.divIcon({
        className: 'custom-origin-icon',
        html: `
          <div style="background: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
            A
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker([trip.origin_coords.lat, trip.origin_coords.lng], { icon: originIcon })
        .bindPopup(`<strong>Origin:</strong> ${trip.origin}`)
        .addTo(group);
    }

    // 3. Draw Destination Marker (Red Pin)
    if (trip.dest_coords) {
      const destIcon = L.divIcon({
        className: 'custom-dest-icon',
        html: `
          <div style="background: #e11d48; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
            B
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker([trip.dest_coords.lat, trip.dest_coords.lng], { icon: destIcon })
        .bindPopup(`<strong>Destination:</strong> ${trip.destination}`)
        .addTo(group);
    }

    // 4. Draw Intermediate Stops Checkpoints
    if (trip.stops && trip.stops.length > 2) {
      trip.stops.slice(1, -1).forEach((stop) => {
        const isPassed = stop.status === 'passed';
        const stopIcon = L.divIcon({
          className: 'custom-stop-icon',
          html: `
            <div style="background: ${isPassed ? '#10b981' : '#3b82f6'}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .bindPopup(`<strong>${stop.name}</strong><br/>ETA: ${stop.estimatedTime}`)
          .addTo(group);
      });
    }

    // 5. Draw Animated Rotating Bus Marker at Current Coordinates
    const busHtml = `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; background: rgba(99, 102, 241, 0.35); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 38px; height: 38px; background: #312e81; color: white; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 6px 16px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; transform: rotate(${Math.round(trip.heading_degrees || 0)}deg); transition: transform 0.6s ease-in-out;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"></path>
            <path d="M15 6v6"></path>
            <path d="M2 12h19.6"></path>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.1-1.1-.3-1.6l-1.4-4.5c-.3-1-.9-1.9-1.8-2.4C17.7 5.2 16.9 5 16 5H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h2"></path>
            <circle cx="7" cy="18" r="2"></circle>
            <path d="M9 18h5"></path>
            <circle cx="16" cy="18" r="2"></circle>
          </svg>
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      className: 'live-bus-marker',
      html: busHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng([trip.current_latitude, trip.current_longitude]);
      busMarkerRef.current.setIcon(busIcon);
    } else {
      busMarkerRef.current = L.marker([trip.current_latitude, trip.current_longitude], {
        icon: busIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }

    busMarkerRef.current.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #312e81; font-size: 13px;">${trip.bus_type || 'Express Bus'}</strong><br/>
        <span>Reg: ${trip.registration_no}</span><br/>
        <span>Speed: <strong>${Math.round(trip.speed_kmh)} km/h</strong></span><br/>
        <span>Next: ${trip.next_stop_name || 'Destination'}</span>
      </div>
    `);

  }, [trip]);

  // Simulation handler
  const handleSimulate = async (action, delayMins = 0) => {
    if (!trip) return;
    setIsSimulating(true);
    try {
      const res = await simulateTripAction(trip.schedule_id, action, delayMins);
      setTrip(res.data.data);
      setToastMessage(`Simulation: Executed action "${action}"`);
    } catch (err) {
      setToastMessage('Simulation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSimulating(false);
    }
  };

  const status = (trip?.trip_status || 'scheduled').toLowerCase();
  const cfg = statusConfig[status] || statusConfig.scheduled;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      <Navbar />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200/90 shadow-xs z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={bookingRef ? `/ticket/${bookingRef}` : '/my-bookings'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live GPS Stream</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                {trip?.origin} ➔ {trip?.destination}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPolling(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoPolling
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="Toggle automatic GPS stream updates"
            >
              <Radio size={14} className={isAutoPolling ? 'animate-pulse text-emerald-600' : ''} />
              <span>{isAutoPolling ? 'Live Polling (4s)' : 'Polling Paused'}</span>
            </button>

            <button
              onClick={() => {
                setLoading(true);
                fetchTelemetry(false);
              }}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Refresh now"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {loading && !trip ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500">Connecting to bus GPS telemetry...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <AlertCircle size={36} className="text-rose-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-900">Trip Telemetry Unavailable</h2>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <Link
              to="/my-bookings"
              className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <ArrowLeft size={14} />
              Back to Bookings
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT COLUMN: Interactive Map (7 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative w-full h-[450px] sm:h-[540px] bg-slate-200 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <div ref={mapRef} className="w-full h-full z-0" />

              {/* Status Overlay Badge on Map */}
              <div className="absolute top-4 left-4 z-1000 flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 border ${cfg.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-ping' : ''}`}></span>
                  <span>{cfg.label}</span>
                </span>
                {trip?.delay_minutes > 0 && (
                  <span className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-black shadow-md flex items-center gap-1">
                    <AlertTriangle size={13} />
                    <span>+{trip.delay_minutes}m Delay</span>
                  </span>
                )}
              </div>

              {/* Speed & Heading HUD Overlay */}
              <div className="absolute bottom-4 left-4 z-1000 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Speed</span>
                    <strong className="text-sm font-bold">{Math.round(trip?.speed_kmh || 0)} km/h</strong>
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-700"></div>
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-teal-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Heading</span>
                    <strong className="text-sm font-bold">{Math.round(trip?.heading_degrees || 0)}°</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Trip Progression Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-500 uppercase tracking-wider text-[11px]">Journey Progression</span>
                <span className="text-indigo-600 font-mono">{Math.round(trip?.progress_percent || 0)}% Completed</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(2, trip?.progress_percent || 0))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-medium">
                <span>{trip?.origin}</span>
                <span>{trip?.destination}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Journey Milestones & Simulator Controls (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Vehicle & Operator Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{trip?.operator_name || 'Shivneri Travels'}</h3>
                  <p className="text-[11px] text-slate-400">{trip?.bus_type} • Reg: {trip?.registration_no}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bus size={18} />
                </div>
              </div>

              {/* Key Indicators Grid */}
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Next Stop</span>
                  <span className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                    {trip?.next_stop_name || 'Destination'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">ETA</span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                    {trip?.next_stop_eta ? new Date(trip.next_stop_eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Arrived'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stops Checklist Timeline */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                <span>Route Stops & Milestones</span>
                <span className="text-[10px] font-mono text-slate-400">{trip?.stops?.length || 0} Checkpoints</span>
              </h4>

              <div className="space-y-4">
                {trip?.stops?.map((stop, idx) => {
                  const isCurrent = stop.status === 'current';
                  const isPassed = stop.status === 'passed';

                  return (
                    <div key={idx} className="flex items-start gap-3 relative">
                      {/* Timeline vertical connector */}
                      {idx < (trip.stops.length - 1) && (
                        <div
                          className={`absolute left-3.5 top-5 w-0.5 h-8 -ml-px ${
                            isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                          isPassed
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <span className="text-[11px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-600' : 'text-slate-800'}`}>
                            {stop.name}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {stop.estimatedTime}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {stop.is_boarding ? 'Boarding Point' : stop.is_dropping ? 'Dropping Point' : 'Highway Checkpoint'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Demo Simulation Controls Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">GPS Simulator Controls</h4>
                </div>
                <button
                  onClick={() => setShowSimulator(prev => !prev)}
                  className="text-[10px] text-indigo-300 hover:text-white underline cursor-pointer"
                >
                  {showSimulator ? 'Collapse' : 'Expand'}
                </button>
              </div>

              <p className="text-[11px] text-indigo-200/70 mb-3 leading-relaxed">
                Test and demonstrate real-time telemetry updates, bearing angle calculation, and route milestone progression.
              </p>

              {showSimulator && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSimulate('step')}
                      disabled={isSimulating}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      <FastForward size={14} />
                      <span>Step +8%</span>
                    </button>
                    <button
                      onClick={() => handleSimulate('delay', 15)}
                      disabled={isSimulating}
                      className="px-3 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      <Clock size={14} />
                      <span>+15m Delay</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSimulate('complete')}
                      disabled={isSimulating}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      <Flag size={14} />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => handleSimulate('reset')}
                      disabled={isSimulating}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default LiveTracking;
