import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  Clock,
  Bus,
  MapPin,
  IndianRupee,
  Users,
} from 'lucide-react';

const MySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(
        'http://localhost:8080/operator/schedules',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSchedules(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch schedules', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-stone-500">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">
            My Schedules
          </h1>
          <p className="text-stone-500 mt-1">
            Manage and monitor all scheduled trips.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#101F33] flex items-center justify-center">
              <CalendarDays className="text-white" size={22} />
            </div>

            <div>
              <p className="text-sm text-stone-500">
                Total Schedules
              </p>
              <h2 className="text-2xl font-semibold text-stone-900">
                {schedules.length}
              </h2>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {schedules.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center">
            <CalendarDays
              size={42}
              className="mx-auto text-stone-300 mb-3"
            />

            <h3 className="text-lg font-medium text-stone-900">
              No Schedules Found
            </h3>

            <p className="text-stone-500 mt-1">
              Create your first schedule to start accepting bookings.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white border border-stone-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
              >
                {/* Route Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 text-xl font-semibold text-stone-900">
                      <MapPin size={18} />
                      {schedule.origin}
                      <span className="text-stone-400">→</span>
                      {schedule.destination}
                    </div>

                    <p className="text-sm text-stone-500 mt-1">
                      Schedule ID: {schedule.id}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      schedule.status === 'scheduled'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {schedule.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <Bus size={15} />
                      Bus
                    </div>

                    <p className="font-medium text-stone-900 mt-1">
                      {schedule.bus_number}
                    </p>

                    <p className="text-sm text-stone-500">
                      {schedule.bus_type
                        ?.replaceAll('_', ' ')
                        ?.toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <Clock size={15} />
                      Departure
                    </div>

                    <p className="font-medium text-stone-900 mt-1">
                      {formatDateTime(schedule.departure_time)}
                    </p>

                    <p className="text-sm text-stone-500 mt-2">
                      Arrival: {formatDateTime(schedule.arrival_time)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <Users size={15} />
                      Available Seats
                    </div>

                    <p className="font-medium text-stone-900 mt-1">
                      {schedule.available_seats}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-stone-500 text-sm">
                      <IndianRupee size={14} />
                      Fare
                    </div>

                    <p className="font-medium text-stone-900">
                      ₹{schedule.base_fare}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySchedules;