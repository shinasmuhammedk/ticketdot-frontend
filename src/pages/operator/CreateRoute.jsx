import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Route } from 'lucide-react';
import { createRoute } from '../../api/operator';

const CreateRoute = () => {
  const [originCityId, setOriginCityId] = useState('');
  const [destinationCityId, setDestinationCityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await createRoute({
        origin_city_id: originCityId,
        destination_city_id: destinationCityId,
      });

      setMessage('Route created successfully');
      setOriginCityId('');
      setDestinationCityId('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create route'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Link
          to="/operator/dashboard"
          className="flex items-center gap-2 text-[#101F33] mb-6"
        >
          <ArrowLeft size={18} />
          Back to Operator Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Route className="text-[#101F33]" />
            <h1 className="text-2xl font-bold text-stone-900">
              Create Route
            </h1>
          </div>

          {message && <p className="mb-4 text-emerald-600">{message}</p>}
          {error && <p className="mb-4 text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Origin City ID"
              value={originCityId}
              onChange={(e) => setOriginCityId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-200"
              required
            />

            <input
              type="text"
              placeholder="Destination City ID"
              value={destinationCityId}
              onChange={(e) => setDestinationCityId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-200"
              required
            />

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#101F33] text-white font-medium disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Route'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoute;