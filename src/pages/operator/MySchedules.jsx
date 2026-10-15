import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Clock, Bus, MapPin, IndianRupee,
  Users, Plus, ArrowRight
} from 'lucide-react';
import { getSchedules } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';

const MySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await getSchedules();
      setSchedules(res.data?.data || []);
    } catch (err) {
      setError('Failed to fetch scheduled trips');
    } finally {
      setLoading(false);
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

  return (
    <OperatorLayout
      title="Trip Schedules"
      subtitle="Monitor departure timings and active seat availability"
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
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-medium">Loading scheduled trips...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
          <CalendarDays size={32} className="mx-auto text-zinc-300 mb-2" />
          <h3 className="text-sm font-bold text-zinc-900">No Schedules Created Yet</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Schedule a trip by selecting a route and assigning an available fleet bus.
          </p>
          <Link
            to="/operator/create-schedule"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
          >
            <Plus size={14} />
            Create First Schedule
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-2xl border border-zinc-200/80 p-5 hover:border-zinc-300 transition-all shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Route & ID */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-base font-bold text-zinc-900">
                    <span>{schedule.origin}</span>
                    <ArrowRight size={14} className="text-zinc-400" />
                    <span>{schedule.destination}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {schedule.status}
                    </span>
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

                {/* Capacity & Fare */}
                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </OperatorLayout>
  );
};

export default MySchedules;