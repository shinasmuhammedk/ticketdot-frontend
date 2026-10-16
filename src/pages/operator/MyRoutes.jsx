import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Route, MapPin, ArrowRight, Plus, CalendarDays, Search } from 'lucide-react';
import { getRoutes } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';

const MyRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await getRoutes();
      setRoutes(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load routes'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.origin?.toLowerCase().includes(q) ||
        r.destination?.toLowerCase().includes(q)
    );
  }, [routes, searchQuery]);

  return (
    <OperatorLayout
      title="Route Network"
      subtitle="Connected origin and destination city pairs across operational territory"
      action={
        <Link
          to="/operator/create-route"
          className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>Add Route</span>
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search corridors by city name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="text-xs text-zinc-500 font-medium">
            <span className="font-bold text-zinc-900">{filteredRoutes.length}</span> {filteredRoutes.length === 1 ? 'corridor' : 'corridors'} active
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-medium">Loading route network...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-xs">
            <Route size={36} className="mx-auto text-zinc-300 mb-3" />
            <h3 className="text-sm font-bold text-zinc-900">
              {searchQuery ? 'No Corridors Match Query' : 'No Routes Established'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? 'Try searching for a different city or clearing your search.'
                : 'Connect an origin and destination city to start scheduling passenger trips.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <Link
                to="/operator/create-route"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
              >
                <Plus size={14} />
                Create First Route
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-3xl border border-zinc-200/80 p-5 hover:border-zinc-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
                      <Route size={15} />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">ID: {route.id.slice(0, 8)}...</span>
                  </div>

                  <div className="flex items-center gap-2 text-base font-bold text-zinc-900">
                    <span>{route.origin}</span>
                    <ArrowRight size={14} className="text-zinc-400" />
                    <span>{route.destination}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Inter-city passenger corridor</p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Active Corridor
                  </span>
                  <Link
                    to="/operator/create-schedule"
                    className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 flex items-center gap-1 group"
                  >
                    <span>Schedule Trip</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OperatorLayout>
  );
};

export default MyRoutes;