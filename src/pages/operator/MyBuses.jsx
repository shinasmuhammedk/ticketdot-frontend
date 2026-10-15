import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Plus, Armchair, Hash } from 'lucide-react';
import { getBuses } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';

const MyBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBuses = async () => {
      try {
        const res = await getBuses();
        setBuses(res.data?.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to load fleet buses'
        );
      } finally {
        setLoading(false);
      }
    };
    loadBuses();
  }, []);

  return (
    <OperatorLayout
      title="Fleet Vehicles"
      subtitle="Manage registered buses and physical seating capacity"
      action={
        <Link
          to="/operator/create-bus"
          className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>Add Bus</span>
        </Link>
      }
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-medium">Loading fleet data...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      ) : buses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
          <Bus size={32} className="mx-auto text-zinc-300 mb-2" />
          <h3 className="text-sm font-bold text-zinc-900">No Fleet Buses Yet</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Add a bus to your fleet to configure seating arrangements and create schedules.
          </p>
          <Link
            to="/operator/create-bus"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
          >
            <Plus size={14} />
            Register Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-2xl border border-zinc-200/80 p-5 hover:border-zinc-300 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
                    <Bus size={18} />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-base text-zinc-900 tracking-tight">
                      {bus.registration_no}
                    </h3>
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                      {bus.bus_type?.replaceAll('_', ' ')}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 flex items-center gap-1">
                  <Armchair size={12} />
                  {bus.total_seats} Seats
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>ID: {bus.id.slice(0, 8)}...</span>
                <span className="text-emerald-600 font-medium">Ready for dispatch</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </OperatorLayout>
  );
};

export default MyBuses;