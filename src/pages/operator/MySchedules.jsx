import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Clock, Bus, MapPin, IndianRupee,
  Users, Plus, ArrowRight, Armchair, Ticket, Search, Filter,
  Ban, AlertTriangle, CheckCircle2, X, Navigation
} from 'lucide-react';
import { getSchedules, cancelSchedule } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';
import BusOccupancyModal from '../../components/operator/BusOccupancyModal';
import Toast from '../Toast';

const MySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSchedule, setActiveSchedule] = useState(null);

  // Cancel Schedule state
  const [cancellingSchedule, setCancellingSchedule] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await getSchedules();
      setSchedules(res.data?.data || []);
    } catch (err) {
      setError('Failed to fetch scheduled trips');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingSchedule) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      await cancelSchedule(cancellingSchedule.id);
      setToastMessage(`Trip schedule ${cancellingSchedule.origin} → ${cancellingSchedule.destination} cancelled.`);
      setCancellingSchedule(null);
      fetchSchedules();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel schedule');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return date;
    }
  };

  const renderStatusBadge = (status) => {
    const s = (status || 'scheduled').toLowerCase();
    if (s === 'scheduled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Scheduled
        </span>
      );
    }
    if (s === 'departed' || s === 'in_transit') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Departed (En Route)
        </span>
      );
    }
    if (s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Completed
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600">
        {status}
      </span>
    );
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        s.origin?.toLowerCase().includes(q) ||
        s.destination?.toLowerCase().includes(q) ||
        s.bus_number?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || s.status?.toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [schedules, searchQuery, statusFilter]);

  return (
    <OperatorLayout
      title="Trip Schedules"
      subtitle="Automated departure monitoring, active seat inventory, and live manifests"
      action={
        <Link
          to="/operator/create-schedule"
          className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>New Schedule</span>
        </Link>
      }
    >
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      <div className="space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by city, bus reg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'scheduled', 'departed', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {tab === 'all' ? 'All Trips' : tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-medium">Loading scheduled trips...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-xs">
            <CalendarDays size={36} className="mx-auto text-zinc-300 mb-3" />
            <h3 className="text-sm font-bold text-zinc-900">
              {searchQuery || statusFilter !== 'all' ? 'No Matching Schedules Found' : 'No Schedules Created Yet'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try clearing the search query or status filter.'
                : 'Schedule a trip by selecting a route and assigning an available fleet bus.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Reset Filter
              </button>
            ) : (
              <Link
                to="/operator/create-schedule"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
              >
                <Plus size={14} />
                Create First Schedule
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchedules.map((schedule) => {
              const isScheduled = schedule.status?.toLowerCase() === 'scheduled';
              return (
                <div
                  key={schedule.id}
                  className="bg-white rounded-3xl border border-zinc-200/80 p-5 hover:border-zinc-300 transition-all shadow-xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Route & Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-base font-bold text-zinc-900 flex-wrap">
                        <span>{schedule.origin}</span>
                        <ArrowRight size={14} className="text-zinc-400 shrink-0" />
                        <span>{schedule.destination}</span>
                        {renderStatusBadge(schedule.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mt-1">
                        <span className="font-mono font-semibold text-zinc-700">{schedule.bus_number}</span>
                        <span className="text-zinc-300">•</span>
                        <span>{schedule.bus_type?.replaceAll('_', ' ')}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="font-mono text-[11px] text-zinc-400">ID: {schedule.id.slice(0, 8)}...</span>
                      </div>
                    </div>

                    {/* Timings */}
                    <div className="flex items-center gap-6 text-xs text-zinc-600 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Depart</span>
                        <span className="font-bold text-zinc-900 text-sm">{formatDateTime(schedule.departure_time)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Arrive</span>
                        <span className="font-bold text-zinc-900 text-sm">{formatDateTime(schedule.arrival_time)}</span>
                      </div>
                    </div>

                    {/* Capacity, Fare & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100">
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Available</span>
                        <span className="font-bold text-zinc-900 text-sm flex items-center gap-1 justify-end">
                          <Users size={13} className="text-zinc-400" />
                          {schedule.available_seats} seats
                        </span>
                      </div>

                      <div className="text-right pl-4 border-l border-zinc-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Fare</span>
                        <span className="text-lg font-black text-zinc-900">₹{schedule.base_fare}</span>
                      </div>

                      <div className="flex items-center gap-1.5 pl-2">
                        <Link
                          to={`/track-trip/${schedule.id}`}
                          className="h-8 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Open Live GPS & Telemetry Simulator"
                        >
                          <Navigation size={13} className="animate-pulse" />
                          <span>Live GPS</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setActiveSchedule(schedule)}
                          className="h-8 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                          title="View live occupied seats map"
                        >
                          <Armchair size={13} />
                          <span>Seats</span>
                        </button>

                        <Link
                          to={`/operator/bookings?schedule=${schedule.id}`}
                          className="h-8 px-3 rounded-xl border border-zinc-200 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="View passengers booked for this trip"
                        >
                          <Ticket size={13} />
                          <span>Manifest</span>
                        </Link>

                        {isScheduled && (
                          <button
                            type="button"
                            onClick={() => { setCancellingSchedule(schedule); setCancelError(''); }}
                            className="h-8 px-2.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                            title="Cancel trip schedule"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Live Bus Occupancy Modal */}
        <BusOccupancyModal
          isOpen={Boolean(activeSchedule)}
          onClose={() => setActiveSchedule(null)}
          schedule={activeSchedule}
        />

        {/* Cancel Schedule Confirmation Modal */}
        {cancellingSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-zinc-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={22} />
              </div>

              <div className="text-center">
                <h3 className="text-sm font-bold text-zinc-900">Cancel Trip Schedule</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Are you sure you want to cancel the upcoming trip for{' '}
                  <span className="font-bold text-zinc-800">
                    {cancellingSchedule.origin} → {cancellingSchedule.destination}
                  </span>?
                </p>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                  This will cancel passenger bookings, release locked seats, and remove the trip from public search.
                </p>
              </div>

              {cancelError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {cancelError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingSchedule(null)}
                  className="w-1/2 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Keep Trip
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                  className="w-1/2 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {cancelLoading ? 'Cancelling...' : 'Cancel Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OperatorLayout>
  );
};

export default MySchedules;