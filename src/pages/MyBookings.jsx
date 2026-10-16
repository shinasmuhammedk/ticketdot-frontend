import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus, Ticket, CheckCircle2, AlertCircle, X,
  Clock, Armchair, Hash, ChevronRight, ArrowRight, AlertTriangle,
  RotateCcw, Navigation, Star
} from 'lucide-react';
import { getMyBookings, cancelBooking } from '../api/bookings';
import Toast from './Toast';
import Navbar from '../components/Navbar';
import ReviewModal from '../components/ReviewModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'cancelled'

  const [pendingCancel, setPendingCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState(null);

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
      bookings.map((b) => {
        const bookedAt = b.confirmed_at || b.booked_at || b.created_at;
        const seatDisplay = b.seats && b.seats.length > 0
          ? b.seats.join(', ')
          : (b.seat_number || b.seat || '—');

        return {
          bookingRef: b.booking_ref || b.id,
          operatorName: b.operator_name || 'Shivneri Travels',
          busType: b.bus_type || 'AC Sleeper',
          origin: b.origin || 'Origin',
          destination: b.destination || 'Destination',
          seats: seatDisplay,
          fare: b.amount != null ? b.amount : 0,
          status: (b.status || 'confirmed').toLowerCase(),
          departureTime: b.departure_time,
          arrivalTime: b.arrival_time,
          paymentId: b.payment_id,
          paymentStatus: b.payment_status,
          refundId: b.refund_id,
          refundStatus: b.refund_status,
          bookedAtFormatted: bookedAt
            ? new Date(bookedAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—',
        };
      }),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    if (activeTab === 'upcoming') {
      return normalized.filter((b) => b.status === 'confirmed');
    }
    if (activeTab === 'cancelled') {
      return normalized.filter((b) => b.status === 'cancelled');
    }
    return normalized;
  }, [normalized, activeTab]);

  const upcomingCount = normalized.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = normalized.filter((b) => b.status === 'cancelled').length;

  const handleConfirmCancel = async () => {
    if (!pendingCancel) return;
    setCancelling(true);
    try {
      const res = await cancelBooking(pendingCancel.bookingRef);
      const cancelData = res.data?.data;
      setBookings((prev) =>
        prev.map((b) =>
          (b.booking_ref || b.id) === pendingCancel.bookingRef
            ? {
                ...b,
                status: 'cancelled',
                refund_id: cancelData?.refund_id || b.refund_id,
                refund_amount: cancelData?.refund_amount,
                refund_status: 'processed',
              }
            : b
        )
      );
      if (cancelData?.refund_id) {
        setToastMessage(`Booking cancelled. Refund of ₹${cancelData.refund_amount} initiated (Ref: ${cancelData.refund_id})`);
      } else {
        setToastMessage(`Booking ${pendingCancel.bookingRef} successfully cancelled.`);
      }
      setPendingCancel(null);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      return new Date(timeStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Manage your upcoming trips and download digital boarding passes
            </p>
          </div>

          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all w-fit cursor-pointer"
          >
            <Bus size={15} />
            <span>Book New Trip</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>All Trips</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-700/50 text-[10px]">{normalized.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Confirmed / Upcoming</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/80 text-white text-[10px]">{upcomingCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cancelled'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Cancelled</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/80 text-white text-[10px]">{cancelledCount}</span>
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-800">Loading your travel history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-3xl p-8 text-center border border-red-200">
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Ticket size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No {activeTab !== 'all' ? activeTab : ''} bookings found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Ready to explore? Choose a route on our dashboard and book your seats in under a minute.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              Search Buses
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isConfirmed = b.status === 'confirmed';
              return (
                <div
                  key={b.bookingRef}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Ref & Route */}
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{b.bookingRef}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          isConfirmed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {b.status}
                        </span>
                        {b.refundId && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Refund: {b.refundId}
                          </span>
                        )}
                      </div>

                      <div className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{b.origin}</span>
                        <span className="text-indigo-500 font-normal">→</span>
                        <span>{b.destination}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                        <span>{b.operatorName}</span>
                        <span className="text-slate-300">•</span>
                        <span>Booked on {b.bookedAtFormatted}</span>
                      </div>
                    </div>

                    {/* Middle: Seats */}
                    <div className="bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 w-fit">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Reserved Seats
                      </span>
                      <span className="text-sm font-black text-indigo-600 flex items-center gap-1.5">
                        <Armchair size={14} />
                        {b.seats}
                      </span>
                    </div>

                    {/* Right: Fare & Action Buttons */}
                    <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-3">
                      <div>
                        <span className="text-xs text-slate-400 font-medium hidden sm:inline mr-1">Paid:</span>
                        <span className="text-xl font-black text-slate-900">
                          ₹{Number(b.fare).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isConfirmed && (
                          <Link
                            to={`/track/${b.bookingRef}`}
                            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Live Bus GPS Tracking"
                          >
                            <Navigation size={13} className="text-emerald-600 animate-pulse" />
                            <span>Track</span>
                          </Link>
                        )}

                        {isConfirmed && (
                          <button
                            type="button"
                            onClick={() => setReviewingBooking(b)}
                            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Rate this journey"
                          >
                            <Star size={13} className="text-amber-500" />
                            <span>Rate</span>
                          </button>
                        )}

                        <Link
                          to={`/ticket/${b.bookingRef}`}
                          className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Boarding Pass</span>
                          <ChevronRight size={14} />
                        </Link>

                        {isConfirmed && (
                          <button
                            onClick={() => setPendingCancel(b)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-semibold transition-colors cursor-pointer"
                            title="Cancel booking"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancellation Modal */}
      {pendingCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Cancel booking #{pendingCancel.bookingRef}?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This action will immediately cancel your trip from <strong className="text-slate-800">{pendingCancel.origin}</strong> to <strong className="text-slate-800">{pendingCancel.destination}</strong> and release seats (<span className="font-bold text-indigo-600">{pendingCancel.seats}</span>) back to inventory.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingCancel(null)}
                disabled={cancelling}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                No, Keep
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <ReviewModal
          isOpen={Boolean(reviewingBooking)}
          onClose={() => setReviewingBooking(null)}
          bookingRef={reviewingBooking.bookingRef}
          origin={reviewingBooking.origin}
          destination={reviewingBooking.destination}
          operatorName={reviewingBooking.operatorName}
          onSuccess={() => {
            setToastMessage('Thank you! Your verified review has been submitted.');
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;