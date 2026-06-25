import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Route, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const MyRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(
        'http://localhost:8080/operator/routes',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoutes(res.data.data || []);
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

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/operator/dashboard"
          className="flex items-center gap-2 text-[#101F33] mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Route className="text-[#101F33]" />
          <h1 className="text-3xl font-bold text-stone-900">
            My Routes
          </h1>
        </div>

        {loading && (
          <p className="text-stone-500">Loading routes...</p>
        )}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && !error && routes.length === 0 && (
          <p className="text-stone-500">
            No routes found.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Route className="text-emerald-600" />
                </div>

                <div>
                  <h2 className="font-bold text-lg text-stone-900">
                    {route.origin}
                  </h2>

                  <p className="text-sm text-stone-500">
                    {route.destination}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Route:</span>
                  <span className="flex items-center gap-1 text-stone-500">
                    <MapPin size={14} />
                    {route.origin}
                    <ArrowRight size={14} className="text-stone-400" />
                    <MapPin size={14} />
                    {route.destination}
                  </span>
                </p>

                <p className="break-all text-stone-500">
                  <span className="font-medium text-stone-700">
                    Route ID:
                  </span>{' '}
                  {route.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyRoutes;