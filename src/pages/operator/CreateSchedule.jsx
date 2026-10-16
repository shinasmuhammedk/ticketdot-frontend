import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays, Bus, Route, Clock, IndianRupee, ArrowLeft,
  ArrowRight, Users, Sparkles, TrendingUp, AlertCircle
} from 'lucide-react';
import { createSchedule, getRoutes, getBuses } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';
import Toast from '../Toast';

const CreateSchedule = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBusId = searchParams.get('busId') || '';
  const preselectedRouteId = searchParams.get('routeId') || '';

  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Pre-calculate sensible default future times (today + 2 hours and + 6 hours)
  const getDefaultDepTime = () => {
    const d = new Date(Date.now() + 2 * 3600000);
    d.setMinutes(0, 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const getDefaultArrTime = () => {
    const d = new Date(Date.now() + 6 * 3600000);
    d.setMinutes(0, 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [routeId, setRouteId] = useState(preselectedRouteId);
  const [busId, setBusId] = useState(preselectedBusId);
  const [departureTime, setDepartureTime] = useState(getDefaultDepTime());
  const [arrivalTime, setArrivalTime] = useState(getDefaultArrTime());
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
        const rList = routesRes.data?.data || [];
        const bList = busesRes.data?.data || [];
        setRoutes(rList);
        setBuses(bList);

        if (preselectedBusId && bList.some((b) => b.id === preselectedBusId)) {
          setBusId(preselectedBusId);
        }
        if (preselectedRouteId && rList.some((r) => r.id === preselectedRouteId)) {
          setRouteId(preselectedRouteId);
        }
      } catch (err) {
        setToastMessage('Failed to load routes and buses');
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [preselectedBusId, preselectedRouteId]);

  const selectedBus = useMemo(() => buses.find((b) => b.id === busId), [buses, busId]);
  const selectedRoute = useMemo(() => routes.find((r) => r.id === routeId), [routes, routeId]);

  const durationText = useMemo(() => {
    if (!departureTime || !arrivalTime) return null;
    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);
    const diffMs = arr.getTime() - dep.getTime();
    if (diffMs <= 0) return null;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  }, [departureTime, arrivalTime]);

  const potentialRevenue = useMemo(() => {
    const fare = Number(baseFare);
    if (!selectedBus?.total_seats || !fare || fare <= 0) return null;
    return fare * selectedBus.total_seats;
  }, [selectedBus, baseFare]);

  const validate = () => {
    const errors = {};
    if (!routeId) errors.routeId = 'Please select a route';
    if (!busId) errors.busId = 'Please assign a bus';
    if (!departureTime) {
      errors.departureTime = 'Specify departure time';
    } else if (new Date(departureTime) <= new Date(Date.now() + 5 * 60000)) {
      errors.departureTime = 'Departure time must be in the future (at least 5-10 minutes ahead) so passengers can book tickets.';
    }
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

      setToastMessage('Trip schedule created! Seat inventory populated and visible to passengers.');
      setTimeout(() => navigate('/operator/schedules'), 1200);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="max-w-2xl bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Important Passenger Visibility Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold block text-amber-950 mb-0.5">Passenger Search Visibility</strong>
            Trips must have a future departure time to be bookable by passengers. When departure time arrives, TicketDot automatically transitions the status to departed to protect passengers from expired tickets.
          </div>
        </div>

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
              disabled={fetchingData}
              className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                fieldErrors.routeId
                  ? 'border-red-500 bg-red-50/40 text-red-900'
                  : 'border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:border-zinc-900'
              }`}
            >
              <option value="">Select a connected city pair...</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.origin_name || r.origin} → {r.destination_name || r.destination}
                </option>
              ))}
            </select>
            {fieldErrors.routeId && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.routeId}</p>
            )}
          </div>

          {/* Bus Asset Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Assigned Vehicle Asset
            </label>
            <select
              value={busId}
              onChange={(e) => {
                setBusId(e.target.value);
                if (fieldErrors.busId) setFieldErrors((p) => ({ ...p, busId: undefined }));
              }}
              disabled={fetchingData}
              className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                fieldErrors.busId
                  ? 'border-red-500 bg-red-50/40 text-red-900'
                  : 'border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:border-zinc-900'
              }`}
            >
              <option value="">Assign vehicle from fleet...</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.registration_no} • {b.bus_type?.replaceAll('_', ' ')} ({b.total_seats} Seats)
                </option>
              ))}
            </select>
            {fieldErrors.busId && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.busId}</p>
            )}
          </div>

          {/* Timings: Departure & Arrival */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Departure Time (Future)
              </label>
              <input
                type="datetime-local"
                value={departureTime}
                min={nowLocalIso}
                onChange={(e) => {
                  setDepartureTime(e.target.value);
                  if (fieldErrors.departureTime) setFieldErrors((p) => ({ ...p, departureTime: undefined }));
                }}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                  fieldErrors.departureTime
                    ? 'border-red-500 bg-red-50/40 text-red-900'
                    : 'border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:border-zinc-900'
                }`}
              />
              {fieldErrors.departureTime && (
                <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.departureTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Arrival Time
              </label>
              <input
                type="datetime-local"
                value={arrivalTime}
                min={departureTime || nowLocalIso}
                onChange={(e) => {
                  setArrivalTime(e.target.value);
                  if (fieldErrors.arrivalTime) setFieldErrors((p) => ({ ...p, arrivalTime: undefined }));
                }}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                  fieldErrors.arrivalTime
                    ? 'border-red-500 bg-red-50/40 text-red-900'
                    : 'border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:border-zinc-900'
                }`}
              />
              {fieldErrors.arrivalTime && (
                <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.arrivalTime}</p>
              )}
            </div>
          </div>

          {/* Base Fare */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Base Seat Fare (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm">₹</span>
              <input
                type="number"
                placeholder="450"
                min="1"
                value={baseFare}
                onChange={(e) => {
                  setBaseFare(e.target.value);
                  if (fieldErrors.baseFare) setFieldErrors((p) => ({ ...p, baseFare: undefined }));
                }}
                className={`w-full h-11 pl-8 pr-3.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                  fieldErrors.baseFare
                    ? 'border-red-500 bg-red-50/40 text-red-900'
                    : 'border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:border-zinc-900'
                }`}
              />
            </div>
            {fieldErrors.baseFare && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.baseFare}</p>
            )}
          </div>

          {/* Operational Metrics Callout */}
          {(durationText || potentialRevenue) && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 grid grid-cols-2 gap-4">
              {durationText && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Est. Duration</span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5">{durationText}</p>
                </div>
              )}
              {potentialRevenue && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Max Trip Gross</span>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">₹{potentialRevenue.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || fetchingData}
              className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <CalendarDays size={16} />
              <span>{loading ? 'Creating Schedule...' : 'Publish Trip Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </OperatorLayout>
  );
};

export default CreateSchedule;