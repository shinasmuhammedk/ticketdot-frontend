import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays, Bus, Route, Clock, IndianRupee, ArrowLeft,
  ArrowRight, Users
} from 'lucide-react';
import { createSchedule, getRoutes, getBuses } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';
import Toast from '../Toast';

const CreateSchedule = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [routeId, setRouteId] = useState('');
  const [busId, setBusId] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [baseFare, setBaseFare] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const nowLocalIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, busesRes] = await Promise.all([getRoutes(), getBuses()]);
        setRoutes(routesRes.data?.data || []);
        setBuses(busesRes.data?.data || []);
      } catch (err) {
        setToastMessage('Failed to load routes and buses');
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const validate = () => {
    const errors = {};
    if (!routeId) errors.routeId = 'Please select a route';
    if (!busId) errors.busId = 'Please assign a bus';
    if (!departureTime) errors.departureTime = 'Specify departure time';
    if (!arrivalTime) errors.arrivalTime = 'Specify arrival time';
    if (departureTime && arrivalTime && new Date(arrivalTime) <= new Date(departureTime)) {
      errors.arrivalTime = 'Arrival must be after departure';
    }
    const fareNum = Number(baseFare);
    if (!baseFare || fareNum <= 0) {
      errors.baseFare = 'Enter a valid base fare (e.g. ₹450)';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await createSchedule({
        route_id: routeId,
        bus_id: busId,
        departure_time: new Date(departureTime).toISOString(),
        arrival_time: new Date(arrivalTime).toISOString(),
        base_fare: Number(baseFare),
      });

      setToastMessage('Trip schedule created! Seat inventory populated.');
      setTimeout(() => navigate('/operator/schedules'), 1000);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const selectedBus = buses.find((b) => b.id === busId);
  const selectedRoute = routes.find((r) => r.id === routeId);

  return (
    <OperatorLayout
      title="Create Schedule"
      subtitle="Schedule a trip and automatically populate seat inventory"
      action={
        <Link
          to="/operator/schedules"
          className="h-9 px-3.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Schedules List</span>
        </Link>
      }
    >
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      <div className="max-w-2xl bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Route Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Assigned Route Corridor
            </label>
            <select
              value={routeId}
              onChange={(e) => {
                setRouteId(e.target.value);
                if (fieldErrors.routeId) setFieldErrors((p) => ({ ...p, routeId: undefined }));
              }}
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all cursor-pointer"
            >
              <option value="">Select established route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.origin} → {r.destination}
                </option>
              ))}
            </select>
            {fieldErrors.routeId && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.routeId}</p>
            )}
            {routes.length === 0 && !fetchingData && (
              <p className="text-xs text-amber-600 mt-1.5">
                No routes available.{' '}
                <Link to="/operator/create-route" className="underline font-bold">
                  Create a route first.
                </Link>
              </p>
            )}
          </div>

          {/* Bus Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Fleet Vehicle
            </label>
            <select
              value={busId}
              onChange={(e) => {
                setBusId(e.target.value);
                if (fieldErrors.busId) setFieldErrors((p) => ({ ...p, busId: undefined }));
              }}
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all cursor-pointer"
            >
              <option value="">Select bus from fleet</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.registration_no} ({b.bus_type?.replaceAll('_', ' ')}) — {b.total_seats} seats
                </option>
              ))}
            </select>
            {fieldErrors.busId && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.busId}</p>
            )}
            {selectedBus && (
              <p className="text-[11px] text-zinc-400 mt-1.5">
                Inventory will automatically inherit <span className="font-bold text-zinc-700">{selectedBus.total_seats} seats</span> from this vehicle's layout.
              </p>
            )}
          </div>

          {/* Timings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Departure Date & Time
              </label>
              <input
                type="datetime-local"
                min={nowLocalIso}
                value={departureTime}
                onChange={(e) => {
                  setDepartureTime(e.target.value);
                  if (fieldErrors.departureTime) setFieldErrors((p) => ({ ...p, departureTime: undefined }));
                }}
                className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all cursor-pointer"
              />
              {fieldErrors.departureTime && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.departureTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Arrival Date & Time
              </label>
              <input
                type="datetime-local"
                min={departureTime || nowLocalIso}
                value={arrivalTime}
                onChange={(e) => {
                  setArrivalTime(e.target.value);
                  if (fieldErrors.arrivalTime) setFieldErrors((p) => ({ ...p, arrivalTime: undefined }));
                }}
                className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all cursor-pointer"
              />
              {fieldErrors.arrivalTime && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.arrivalTime}</p>
              )}
            </div>
          </div>

          {/* Base Fare */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Base Seat Fare (₹)
            </label>
            <div className="relative">
              <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="50"
                step="10"
                placeholder="e.g. 650"
                value={baseFare}
                onChange={(e) => {
                  setBaseFare(e.target.value);
                  if (fieldErrors.baseFare) setFieldErrors((p) => ({ ...p, baseFare: undefined }));
                }}
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all"
              />
            </div>
            {fieldErrors.baseFare && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.baseFare}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <Link
              to="/operator/schedules"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || fetchingData}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Schedule...' : 'Publish Trip Schedule'}
            </button>
          </div>
        </form>
      </div>
    </OperatorLayout>
  );
};

export default CreateSchedule;