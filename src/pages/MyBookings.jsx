import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { getMyBookings, cancelBooking } from '../api/bookings';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const res = await getMyBookings();
                console.log('MY BOOKINGS:', res.data);
                console.log("BOOKING OBJECT:", res.data.data?.[0]);

                setBookings(res.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Failed to load bookings'
                );
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);


    const handleCancel = async (bookingRef) => {
        try {
            await cancelBooking(bookingRef);

            setBookings((prev) =>
                prev.map((b) =>
                    b.booking_ref === bookingRef ||
                        b.booking_id === bookingRef ||
                        b.id === bookingRef
                        ? { ...b, status: 'cancelled' }
                        : b
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-stone-900">My Bookings</h1>

                <Link
                    to="/dashboard"
                    className="text-sm font-medium text-[#101F33] hover:text-[#E8A33D] transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>

            {loading && <p className="text-stone-500">Loading bookings...</p>}

            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && bookings.length === 0 && (
                <p className="text-stone-500">No bookings found.</p>
            )}

            <div className="space-y-6">
                {bookings.map((b) => {
                    const bookingId = b.booking_id || b.id || b.booking_ref;
                    const operatorName = b.operator_name || b.operator || 'Bus Operator';
                    const busType = b.bus_type || b.type || 'Bus';
                    const seat = b.seat || b.seat_number || '-';
                    const fare = b.fare || b.amount || b.total_fare || 0;
                    const status = b.status || 'confirmed';
                    const bookedAt = b.booked_at || b.created_at || b.date;

                    return (
                        <div
                            key={bookingId}
                            className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row md:items-center justify-between"
                        >
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Bus size={24} />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-stone-900">
                                        {operatorName} – {busType}
                                    </h2>

                                    <p className="text-sm text-stone-500">
                                        Booking Ref: {bookingId}
                                    </p>

                                    <p className="text-sm text-stone-500">
                                        Seat {seat}
                                    </p>

                                    {bookedAt && (
                                        <p className="text-sm text-stone-500">
                                            Booked At: {new Date(bookedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end space-y-2">
                                <div className="text-lg font-bold text-stone-900">
                                    ₹{fare}
                                </div>

                                <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${status.toLowerCase() === 'confirmed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : status.toLowerCase() === 'cancelled'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-stone-200 text-stone-600'
                                        }`}
                                >
                                    {status}
                                </span>

                                {status.toLowerCase() === 'confirmed' && (
                                    <button
                                        onClick={() => handleCancel(b.booking_ref || b.booking_id || b.id)}
                                        className="text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyBookings;