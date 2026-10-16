import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBookingDetails, cancelBooking, emailBookingTicket } from '../api/bookings';
import { getBookingReview } from '../api/reviews';
import { generatePdfTicket } from '../utils/generatePdfTicket';
import {
  ArrowLeft, Bus, Armchair, Hash, Clock, CheckCircle2,
  XCircle, AlertCircle, User, CreditCard, Calendar,
  Download, Share2, Printer, QrCode, AlertTriangle, MapPin,
  Users, Phone, Mail, Send, Loader2, Navigation, Star
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import Toast from './Toast';
import ReviewModal from '../components/ReviewModal';

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

  // PDF & Email Dispatch State
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await getBookingDetails(bookingRef);
        setTicket(res.data.data);

        // Check if user has already reviewed this trip
        try {
          const revRes = await getBookingReview(bookingRef);
          if (revRes.data?.data) {
            setUserReview(revRes.data.data);
          }
        } catch (e) {
          // ignore review check error
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          (typeof err.response?.data === 'string' ? err.response?.data : '') ||
          err.message ||
          'Failed to load boarding pass';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [bookingRef]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelBooking(bookingRef);
      const cancelData = res.data?.data;
      setTicket((prev) => ({
        ...prev,
        status: 'cancelled',
        refund_id: cancelData?.refund_id || prev?.refund_id,
        refund_amount: cancelData?.refund_amount || prev?.refund_amount,
        refund_status: cancelData?.refund_status || 'processed',
        payment_status: 'refunded',
      }));
      if (cancelData?.refund_id) {
        setToastMessage(`Booking cancelled. Refund of ₹${cancelData.refund_amount} initiated (Ref: ${cancelData.refund_id})`);
      } else {
        setToastMessage('Booking successfully cancelled. Seats have been released.');
      }
      setShowCancelModal(false);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!ticket) return;
    setDownloadingPdf(true);
    try {
      await generatePdfTicket(ticket);
      setToastMessage('E-Ticket PDF successfully downloaded!');
    } catch (err) {
      setToastMessage('Failed to generate PDF: ' + (err.message || 'error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleOpenEmailModal = () => {
    setTargetEmail(ticket?.contact_email || '');
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    const emailToSend = targetEmail.trim() || ticket?.contact_email;
    if (!emailToSend) {
      setToastMessage('Please enter a valid recipient email address');
      return;
    }
    setSendingEmail(true);
    try {
      const res = await emailBookingTicket(ticket.booking_ref || bookingRef, emailToSend);
      setToastMessage(res.data?.message || `E-Ticket dispatched to ${emailToSend}`);
      setShowEmailModal(false);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to dispatch e-ticket email');
    } finally {
      setSendingEmail(false);
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

  // Boarding & Dropping Points directly from database record
  const boardingPoint = ticket.boarding_point || `${ticket.origin} Central Bus Station`;
  const droppingPoint = ticket.dropping_point || `${ticket.destination} Main Terminal`;

  const qrPayload = JSON.stringify({
    ref: ticket.booking_ref || bookingRef,
    passenger: ticket.passenger_name || 'Passenger',
    route: `${ticket.origin} -> ${ticket.destination}`,
    seats: ticket.seats || [ticket.seat_number],
    dep: ticket.departure_time,
    boarding: boardingPoint,
    dropping: droppingPoint,
    status: ticket.status,
    verified_by: 'TicketDot_Platform',
  });

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
            {!isCancelled && (
              <Link
                to={`/track/${ticket.booking_ref || bookingRef}`}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
                title="Track Live Bus GPS & Telemetry"
              >
                <Navigation size={14} className="animate-pulse" />
                <span>Live Track</span>
              </Link>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              title="Download official PDF E-Ticket"
            >
              {downloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{downloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleOpenEmailModal}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Dispatch E-Ticket to Email"
            >
              <Mail size={14} />
              <span className="hidden sm:inline">Email Ticket</span>
            </button>

            {!isCancelled && (
              userReview ? (
                <div
                  className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  title="Your Verified Review"
                >
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span>Rated {Number(userReview.rating).toFixed(1)} ★</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Rate your journey experience"
                >
                  <Star size={14} className="text-amber-500" />
                  <span>Rate Journey</span>
                </button>
              )
            )}

            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Boarding Pass"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>

            {!isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
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

            {/* Live GPS Telemetry Callout */}
            {!isCancelled && (
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold text-emerald-300">Live GPS Stream Active</span>
                </div>
                <Link
                  to={`/track/${ticket.booking_ref || bookingRef}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-200 transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/15"
                >
                  <Navigation size={13} className="text-emerald-400" />
                  <span>Open Live Map & ETA ➔</span>
                </Link>
              </div>
            )}
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Contact</span>
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

            {/* Payment Gateway & Refund Info Strip */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CreditCard size={17} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Payment Gateway Details</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ticket.payment_status === 'refunded' || isCancelled
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ticket.payment_status === 'refunded' || isCancelled ? 'Refunded' : (ticket.payment_status || 'Paid')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Txn ID: {ticket.payment_id || `pay_${(ticket.booking_ref || '').toLowerCase()}`} • {ticket.payment_method || 'Online Card/UPI'}
                  </p>
                </div>
              </div>

              {(ticket.refund_id || isCancelled) && (
                <div className="text-left sm:text-right bg-white sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-amber-200 sm:border-0">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Refund Processed (₹{ticket.refund_amount || ticket.amount})
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    Ref: {ticket.refund_id || `rfnd_${ticket.booking_ref}`}
                  </span>
                  <p className="text-[10px] text-slate-400">Credited to source (5-7 business days)</p>
                </div>
              )}
            </div>

            {/* Passenger Manifest Per-Seat List */}
            {ticket.passengers && ticket.passengers.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Users size={14} className="text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Passenger Manifest ({ticket.passengers.length} Passenger{ticket.passengers.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-2xs">
                  <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 grid grid-cols-12">
                    <span className="col-span-3">Seat</span>
                    <span className="col-span-5">Passenger Name</span>
                    <span className="col-span-2">Age</span>
                    <span className="col-span-2 text-right">Gender</span>
                  </div>
                  {ticket.passengers.map((p, idx) => (
                    <div key={p.seat_number || idx} className="px-4 py-2.5 text-xs grid grid-cols-12 items-center bg-white">
                      <span className="col-span-3 font-black text-indigo-700">Seat {p.seat_number}</span>
                      <span className="col-span-5 font-bold text-slate-900">{p.name || 'Passenger'}</span>
                      <span className="col-span-2 text-slate-600 font-medium">{p.age ? `${p.age} yrs` : '—'}</span>
                      <span className="col-span-2 text-right text-slate-600 font-medium">{p.gender || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boarding & Dropping Points Card */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <MapPin size={15} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Boarding Point</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{boardingPoint}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Please arrive 15 minutes before departure</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <MapPin size={15} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Dropping Point</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{droppingPoint}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Subject to highway traffic conditions</p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            {(ticket.contact_phone || ticket.contact_email) && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 px-1">
                {ticket.contact_phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-indigo-600" />
                    <span className="text-slate-400">Mobile:</span>
                    <strong className="text-slate-800 font-semibold">{ticket.contact_phone}</strong>
                  </span>
                )}
                {ticket.contact_email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-indigo-600" />
                    <span className="text-slate-400">Email:</span>
                    <strong className="text-slate-800 font-semibold">{ticket.contact_email}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Authentic Scannable QR Code & Verification Section */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0">
                  <QRCodeSVG
                    value={qrPayload}
                    size={88}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-900">Official Boarding Pass QR</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Scannable by conductor handheld terminal or station turnstile.
                  </p>
                  <p className="text-[11px] font-mono font-bold text-indigo-600 mt-1">
                    HASH: {ticket.booking_ref}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-medium sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <p>Status: <span className="font-bold text-emerald-600 capitalize">{ticket.status}</span></p>
                <p className="mt-0.5">Issued: {formatDateTime(ticket.confirmed_at)}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">TicketDot Verified E-Pass</p>
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

      {/* Email E-Ticket Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Email E-Ticket</h3>
                  <p className="text-[11px] text-slate-400">Receive boarding pass in your inbox</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              We'll send the complete reservation summary, passenger manifest, and scannable QR pass for booking <strong className="text-slate-800 font-mono">#{ticket?.booking_ref}</strong>.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="passenger@example.com"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                disabled={sendingEmail}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail || !targetEmail.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {sendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{sendingEmail ? 'Dispatching...' : 'Send E-Ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          bookingRef={ticket?.booking_ref || bookingRef}
          origin={ticket?.origin}
          destination={ticket?.destination}
          operatorName={ticket?.operator_name}
          onSuccess={(newReview) => {
            setUserReview(newReview);
            setToastMessage('Thank you! Your verified review has been submitted.');
          }}
        />
      )}
    </div>
  );
};

export default TicketDetails;