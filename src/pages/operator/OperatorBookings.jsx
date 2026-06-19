import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ticket } from 'lucide-react';
import { getOperatorBookings } from '../../api/operator';

const OperatorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await getOperatorBookings();
        console.log('OPERATOR BOOKINGS:', res.data);

        setBookings(res.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to load operator bookings'
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/operator/dashboard"
          className="flex items-center gap-2 text-[#101F33] mb-6"
        >
          <ArrowLeft size={18} />
          Back to Operator Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="text-[#101F33]" />
            <h1 className="text-2xl font-bold text-stone-900">
              Operator Bookings
            </h1>
          </div>

          {loading && <p className="text-stone-500">Loading bookings...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && bookings.length === 0 && (
            <p className="text-stone-500">No bookings found.</p>
          )}

          <div className="space-y-4">
            {bookings.map((b) => {
              const bookingRef = b.booking_ref || b.booking_id || b.id;
              const passenger = b.passenger_name || b.user_name || b.email || 'Passenger';
              const seat = b.seat || b.seat_number || '-';
              const fare = b.fare || b.amount || b.total_fare || 0;
              const status = b.status || 'confirmed';
              const bookedAt = b.booked_at || b.created_at;

              return (
                <div
                  key={bookingRef}
                  className="border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h2 className="font-semibold text-stone-900">
                      Booking Ref: {bookingRef}
                    </h2>

                    <p className="text-sm text-stone-500">
                      Passenger: {passenger}
                    </p>

                    <p className="text-sm text-stone-500">
                      Seat: {seat}
                    </p>

                    {bookedAt && (
                      <p className="text-sm text-stone-500">
                        Booked At: {new Date(bookedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <p className="text-lg font-bold text-stone-900">
                      ₹{fare}
                    </p>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        status.toLowerCase() === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : status.toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorBookings;