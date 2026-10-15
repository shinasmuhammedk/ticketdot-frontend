import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBookingDetails, cancelBooking } from '../api/bookings';
import {
  ArrowLeft, Bus, Armchair, Hash, Clock, CheckCircle2,
  XCircle, AlertCircle, User, CreditCard, Calendar,
  Download, Share2, Printer, QrCode, AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Toast from './Toast';

const statusConfig = {
  confirmed: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Confirmed & Valid',
  },
  cancelled: {
    icon: XCircle,
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Cancelled',
  },
  completed: {
    icon: CheckCircle2,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    label: 'Trip Completed',
  },
};

const TicketDetails = () => {
  const { bookingRef } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Cancel dialog state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await getBookingDetails(bookingRef);
        setTicket(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load boarding pass');
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [bookingRef]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(bookingRef);
      setTicket((prev) => ({ ...prev, status: 'cancelled' }));
      setToastMessage('Booking successfully cancelled. Seats have been released.');
      setShowCancelModal(false);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading your boarding pass...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <AlertCircle size={36} className="text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">Ticket Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">{error || 'The requested booking reference does not exist.'}</p>
            <Link
              to="/my-bookings"
              className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <ArrowLeft size={14} />
              Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = (ticket.status || 'confirmed').toLowerCase();
  const cfg = statusConfig[status] || statusConfig.confirmed;
  const isCancelled = status === 'cancelled';
  const seatsList = ticket.seats && ticket.seats.length > 0
    ? ticket.seats.join(', ')
    : (ticket.seat_number || '—');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Top Header Controls (Hidden on Print) */}
      <div className="no-print bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/my-bookings"
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>My Bookings</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>

            {!isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Boarding Pass Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="print-card bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">

          {/* Top Boarding Pass Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Bus size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">
                    {ticket.operator_name || 'Express Line'}
                  </h2>
                  <p className="text-xs text-indigo-200 font-medium mt-0.5">
                    {ticket.bus_type?.replaceAll('_', ' ')} • Reg: {ticket.bus_registration || 'Scheduled Bus'}
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 self-start sm:self-auto ${cfg.bg}`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span>{cfg.label}</span>
              </div>
            </div>

            {/* Route Timeline Display */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Departure</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">{ticket.origin}</p>
                <p className="text-xs text-slate-300 mt-1 font-medium">{formatDateTime(ticket.departure_time)}</p>
              </div>

              <div className="flex flex-col items-center px-4">
                <Bus size={18} className="text-indigo-400 mb-1" />
                <div className="w-20 sm:w-32 border-t-2 border-dashed border-indigo-400/50" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mt-1">Direct</span>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Arrival</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">{ticket.destination}</p>
                <p className="text-xs text-slate-300 mt-1 font-medium">{formatDateTime(ticket.arrival_time)}</p>
              </div>
            </div>
          </div>

          {/* Perforated Ticket Divider with Notches */}
          <div className="relative h-6 bg-white flex items-center justify-between">
            <div className="w-5 h-6 rounded-r-full bg-slate-50 border-r border-slate-200 -ml-0.5" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-5 h-6 rounded-l-full bg-slate-50 border-l border-slate-200 -mr-0.5" />
          </div>

          {/* Passenger & Ticket Details Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passenger</span>
                <p className="text-sm font-bold text-slate-900 mt-1 truncate">{ticket.passenger_name || 'Passenger'}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Seats</span>
                <p className="text-base font-black text-indigo-600 mt-0.5">{seatsList}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Booking Ref</span>
                <p className="text-sm font-mono font-black text-slate-900 mt-1">{ticket.booking_ref || bookingRef}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Paid</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  ₹{Number(ticket.amount || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Simulated QR Code / Barcode Section for boarding */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center p-2 text-slate-800">
                  <QrCode size={44} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Digital Boarding Pass</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Show this code or reference at departure gate</p>
                  <p className="text-xs font-mono font-semibold text-slate-600 mt-1">ID: {ticket.booking_ref}</p>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-medium sm:text-right">
                <p>Status: <span className="font-bold text-emerald-600 capitalize">{ticket.status}</span></p>
                <p className="mt-0.5">Issued: {formatDateTime(ticket.confirmed_at)}</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Cancel this booking?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to cancel booking <strong className="text-slate-800 font-mono">{ticket.booking_ref}</strong>?
              This will release your seats (<span className="font-bold text-indigo-600">{seatsList}</span>) back to public inventory immediately.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;