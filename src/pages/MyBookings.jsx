import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Bus,
    ArrowLeft,
    Ticket,
    CheckCircle2,
    AlertCircle,
    X,
    AlertTriangle,
    Clock,
    Armchair,
    Hash,
    ChevronRight,
} from 'lucide-react';
import { getMyBookings, cancelBooking } from '../api/bookings';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [pendingCancel, setPendingCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const res = await getMyBookings();
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

    const normalized = useMemo(
        () =>
            bookings
                .map((b) => {
                    const bookedAt = b.booked_at || b.created_at || b.date;
                    const departTime = b.departure_time || b.depart_at || bookedAt;
                    return {
                        bookingId: b.booking_id || b.id || b.booking_ref,
                        cancelRef: b.booking_ref || b.booking_id || b.id,
                        operatorName: b.operator_name || b.operator || 'Bus operator',
                        busType: b.bus_type || b.type || 'Bus',
                        origin: b.origin || b.from_city || null,
                        destination: b.destination || b.to_city || null,
                        seat: b.seat || b.seat_number || '-',
                        fare: b.fare || b.amount || b.total_fare || 0,
                        status: (b.status || 'confirmed').toLowerCase(),
                        departTime,
                        departTimeValue: departTime ? new Date(departTime).getTime() : 0,
                        bookedAtLabel: bookedAt
                            ? new Date(bookedAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            : null,
                    };
                })
                .sort((a, b) => a.departTimeValue - b.departTimeValue),
        [bookings]
    );

    const upcoming = normalized.filter((b) => b.status === 'confirmed');
    const nextTrip = upcoming[0];
    const rest = normalized.filter((b) => b.bookingId !== nextTrip?.bookingId);

    const handleConfirmCancel = async () => {
        if (!pendingCancel) return;
        setCancelling(true);
        setCancelError('');
        try {
            await cancelBooking(pendingCancel.cancelRef);
            setBookings((prev) =>
                prev.map((b) =>
                    (b.booking_ref || b.booking_id || b.id) === pendingCancel.cancelRef
                        ? { ...b, status: 'cancelled' }
                        : b
                )
            );
            setMessage(`Booking ${pendingCancel.bookingId} has been cancelled`);
            setPendingCancel(null);
        } catch (err) {
            setCancelError(err.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    const statusConfig = {
        confirmed: { dot: 'bg-blue-500', label: 'Confirmed', text: 'text-blue-700', bg: 'bg-blue-50' },
        cancelled: { dot: 'bg-gray-300', label: 'Cancelled', text: 'text-gray-500', bg: 'bg-gray-50' },
        completed: { dot: 'bg-emerald-500', label: 'Completed', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} strokeWidth={1.5} />
                        <span className="hidden sm:inline">Back</span>
                    </Link>
                    <div className="h-4 w-px bg-gray-200" />
                    <h1 className="text-sm font-medium text-gray-900">My bookings</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Messages */}
                {message && (
                    <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                        <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={1.5} />
                        <p className="text-sm text-emerald-700 flex-1">{message}</p>
                        <button onClick={() => setMessage('')} className="text-emerald-400 hover:text-emerald-600">
                            <X size={14} />
                        </button>
                    </div>
                )}
                {error && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" strokeWidth={1.5} />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="space-y-4">
                        <div className="h-40 bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" />
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && normalized.length === 0 && (
                    <div className="flex flex-col items-center text-center py-20">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
                            <Ticket size={24} className="text-gray-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-gray-900 font-medium text-base">No bookings yet</p>
                        <p className="text-gray-400 text-sm mt-1 mb-6">
                            Once you book a trip, it'll show up here.
                        </p>
                        <Link
                            to="/dashboard"
                            className="h-10 px-5 rounded-xl bg-blue-600 text-white text-sm font-medium flex items-center hover:bg-blue-700 transition-colors"
                        >
                            Search buses
                        </Link>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && normalized.length > 0 && (
                    <>
                        {/* Next trip */}
                        {nextTrip ? (
                            <div className="mb-8">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 px-1">
                                    Your next trip
                                </p>
                                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                                    <Bus size={18} className="text-blue-600" strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-semibold text-gray-900">
                                                        {nextTrip.origin && nextTrip.destination
                                                            ? `${nextTrip.origin} \u2192 ${nextTrip.destination}`
                                                            : `${nextTrip.operatorName}`}
                                                    </h2>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {nextTrip.operatorName} \u00b7 {nextTrip.busType}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xl font-semibold text-gray-900 shrink-0">
                                                \u20b9{Number(nextTrip.fare).toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Hash size={13} strokeWidth={1.5} />
                                                {nextTrip.bookingId}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Armchair size={13} strokeWidth={1.5} />
                                                Seat {nextTrip.seat}
                                            </div>
                                            {nextTrip.bookedAtLabel && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Clock size={13} strokeWidth={1.5} />
                                                    {nextTrip.bookedAtLabel}
                                                </div>
                                            )}
                                            <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                Confirmed
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-5 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <Link
                                            to={`/ticket/${nextTrip.cancelRef}`}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            View ticket
                                            <ChevronRight size={12} />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setCancelError('');
                                                setPendingCancel(nextTrip);
                                            }}
                                            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center mb-8">
                                <p className="text-sm text-gray-500">No upcoming trips right now.</p>
                            </div>
                        )}

                        {/* All bookings */}
                        {rest.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 px-1">
                                    All bookings
                                </p>
                                <div className="space-y-2">
                                    {rest.map((b) => {
                                        const cfg = statusConfig[b.status] || statusConfig.confirmed;
                                        return (
                                            <div
                                                key={b.bookingId}
                                                className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                                            <Bus size={15} className="text-gray-400" strokeWidth={1.5} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {b.origin && b.destination
                                                                    ? `${b.origin} \u2192 ${b.destination}`
                                                                    : `${b.operatorName}`}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                Seat {b.seat} \u00b7 {b.bookingId}
                                                                {b.bookedAtLabel ? ` \u00b7 ${b.bookedAtLabel}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            \u20b9{Number(b.fare).toLocaleString('en-IN')}
                                                        </p>
                                                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
                                                            <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {b.status === 'confirmed' && (
                                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                                                        <Link
                                                            to={`/ticket/${b.cancelRef}`}
                                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                        >
                                                            View ticket
                                                            <ChevronRight size={12} />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                setCancelError('');
                                                                setPendingCancel(b);
                                                            }}
                                                            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Cancel modal */}
            {pendingCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <AlertTriangle size={18} className="text-red-500" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Cancel this booking?</h3>
                        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                            {pendingCancel.operatorName} \u2013 {pendingCancel.busType}, seat {pendingCancel.seat}.
                            This can't be undone.
                        </p>

                        {cancelError && (
                            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" strokeWidth={1.5} />
                                <p className="text-xs text-red-600">{cancelError}</p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setPendingCancel(null)}
                                disabled={cancelling}
                                className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40"
                            >
                                Keep booking
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={cancelling}
                                className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {cancelling ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Cancel booking'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;