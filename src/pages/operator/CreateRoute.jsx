import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Route, MapPin, ArrowRight, ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { createRoute, getCities } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';
import Toast from '../Toast';

const CreateRoute = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [originCityId, setOriginCityId] = useState('');
  const [destinationCityId, setDestinationCityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await getCities();
        setCities(res.data?.data || []);
      } catch (err) {
        setToastMessage('Failed to load supported cities');
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, []);

  const handleSwap = () => {
    const temp = originCityId;
    setOriginCityId(destinationCityId);
    setDestinationCityId(temp);
  };

  const validate = () => {
    const errors = {};
    if (!originCityId) errors.originCityId = 'Select origin city';
    if (!destinationCityId) errors.destinationCityId = 'Select destination city';
    if (originCityId && destinationCityId && originCityId === destinationCityId) {
      errors.destinationCityId = 'Origin and destination cannot be the same';
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
      await createRoute({
        origin_city_id: originCityId,
        destination_city_id: destinationCityId,
      });

      setToastMessage('Route established successfully.');
      setTimeout(() => navigate('/operator/routes'), 1000);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to establish route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OperatorLayout
      title="Create Route"
      subtitle="Establish a new travel corridor in your operational network"
      action={
        <Link
          to="/operator/routes"
          className="h-9 px-3.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Routes List</span>
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
          <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-center">
            {/* Origin City */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Origin City
              </label>
              <select
                value={originCityId}
                onChange={(e) => {
                  setOriginCityId(e.target.value);
                  if (fieldErrors.originCityId) setFieldErrors((p) => ({ ...p, originCityId: undefined }));
                }}
                className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all cursor-pointer"
              >
                <option value="">Select departure city</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.state ? `(${c.state})` : ''}
                  </option>
                ))}
              </select>
              {fieldErrors.originCityId && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.originCityId}</p>
              )}
            </div>

            {/* Swap Button */}
            <div className="hidden md:flex md:col-span-1 justify-center pt-5">
              <button
                type="button"
                onClick={handleSwap}
                className="w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Swap origin and destination"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>

            {/* Destination City */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Destination City
              </label>
              <select
                value={destinationCityId}
                onChange={(e) => {
                  setDestinationCityId(e.target.value);
                  if (fieldErrors.destinationCityId) setFieldErrors((p) => ({ ...p, destinationCityId: undefined }));
                }}
                className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all cursor-pointer"
              >
                <option value="">Select arrival city</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.state ? `(${c.state})` : ''}
                  </option>
                ))}
              </select>
              {fieldErrors.destinationCityId && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.destinationCityId}</p>
              )}
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            Once created, you can assign fleet buses and departure schedules to this route corridor.
          </p>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <Link
              to="/operator/routes"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || citiesLoading}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Establish Route'}
            </button>
          </div>
        </form>
      </div>
    </OperatorLayout>
  );
};

export default CreateRoute;