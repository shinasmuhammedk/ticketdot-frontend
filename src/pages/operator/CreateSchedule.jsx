import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { createSchedule } from '../../api/operator';

const CreateSchedule = () => {
  const [routeId, setRouteId] = useState('');
  const [busId, setBusId] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState(40);
  const [baseFare, setBaseFare] = useState(450);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toISOWithIndiaOffset = (value) => {
    if (!value) return '';
    return `${value}:00+05:30`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await createSchedule({
        route_id: routeId,
        bus_id: busId,
        departure_time: toISOWithIndiaOffset(departureTime),
        arrival_time: toISOWithIndiaOffset(arrivalTime),
        available_seats: Number(availableSeats),
        base_fare: Number(baseFare),
      });

      setMessage('Schedule created successfully');
      setRouteId('');
      setBusId('');
      setDepartureTime('');
      setArrivalTime('');
      setAvailableSeats(40);
      setBaseFare(450);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create schedule'
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
            <CalendarDays className="text-[#101F33]" />
            <h1 className="text-2xl font-bold text-stone-900">
              Create Schedule
            </h1>
          </div>

          {message && <p className="mb-4 text-emerald-600">{message}</p>}
          {error && <p className="mb-4 text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Route ID"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-200"
              required
            />

            <input
              type="text"
              placeholder="Bus ID"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-200"
              required
            />

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Departure Time
              </label>
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-stone-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Arrival Time
              </label>
              <input
                type="datetime-local"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-stone-200"
                required
              />
            </div>

            <input
              type="number"
              placeholder="Available Seats"
              value={availableSeats}
              onChange={(e) => setAvailableSeats(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-200"
              min="1"
              required
            />

            <input
              type="number"
              placeholder="Base Fare"
              value={baseFare}
              onChange={(e) => setBaseFare(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-200"
              min="1"
              required
            />

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#101F33] text-white font-medium disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSchedule;