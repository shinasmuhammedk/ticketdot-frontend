import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, Bus, Armchair, Hash, ArrowRight, Copy, Check,
  Calendar, Download, MapPin, Users, Phone, Mail
} from 'lucide-react';
import { getBookingDetails } from '../api/bookings';
import { generatePdfTicket } from '../utils/generatePdfTicket';
import Toast from './Toast';
import Navbar from '../components/Navbar';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || searchParams.get('bookingRef');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(Boolean(ref));
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!ref) {
      setError('No booking reference provided');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await getBookingDetails(ref);
        setBooking(res.data?.data);
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to load booking details';
        setError(msg);
        setToastMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [ref]);

  const copyToClipboard = () => {
    const textToCopy = booking?.booking_ref || ref;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setToastMessage('Booking reference copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    if (!booking) return;
    setDownloadingPdf(true);
    try {
      await generatePdfTicket(booking);
      setToastMessage('Official E-Ticket PDF successfully downloaded!');
    } catch (err) {
      setToastMessage('Failed to generate PDF: ' + (err.message || 'error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const displaySeats = booking?.seats && booking.seats.length > 0
    ? booking.seats.join(', ')
    : (booking?.seat_number || searchParams.get('seat') || '-');

  const displayAmount = booking?.amount != null
    ? booking.amount
    : (searchParams.get('fare') || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-200">
          
          {/* Animated Celebration Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
            <CheckCircle2 size={42} strokeWidth={2.2} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Your seats have been successfully reserved and tickets issued.
          </p>

          {/* Reference Badge with Copy Action */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                Booking Reference
              </span>
              <p className="text-xl font-mono font-black text-indigo-950 mt-0.5">
                {booking?.booking_ref || ref}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Copy reference code"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Trip Summary Details */}
          {loading ? (
            <div className="py-8">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading booking details...</p>
            </div>
          ) : (
            <div className="mt-6 bg-slate-50/80 rounded-2xl p-5 text-left space-y-3.5 border border-slate-200/60">
              {booking?.origin && booking?.destination && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                    <Bus size={14} className="text-slate-400" /> Route
                  </span>
                  <span className="font-bold text-slate-900">
                    {booking.origin} → {booking.destination}
                  </span>
                </div>
              )}

              {booking?.operator_name && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 text-xs font-medium">Operator</span>
                  <span className="font-semibold text-slate-900">{booking.operator_name}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <Armchair size={14} className="text-slate-400" /> Confirmed Seats
                </span>
                <span className="font-black text-indigo-600">{displaySeats}</span>
              </div>

              {/* Per-seat Passenger details */}
              {booking?.passengers && booking.passengers.length > 0 && (
                <div className="pt-2.5 border-t border-slate-200/60 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Passenger Manifest
                  </span>
                  <div className="space-y-1.5">
                    {booking.passengers.map((p) => (
                      <div key={p.seat_number} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800">
                          {p.name} {p.age ? `(${p.age}${p.gender ? '/' + p.gender.charAt(0) : ''})` : ''}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                          Seat {p.seat_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boarding and Dropping points from DB */}
              {(booking?.boarding_point || booking?.dropping_point) && (
                <div className="pt-2.5 border-t border-slate-200/60 space-y-1.5 text-xs">
                  {booking.boarding_point && (
                    <div className="flex justify-between items-start">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                        <MapPin size={12} className="text-indigo-600" /> Boarding Point:
                      </span>
                      <span className="font-semibold text-slate-900 text-right ml-2">
                        {booking.boarding_point}
                      </span>
                    </div>
                  )}
                  {booking.dropping_point && (
                    <div className="flex justify-between items-start">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                        <MapPin size={12} className="text-emerald-600" /> Dropping Point:
                      </span>
                      <span className="font-semibold text-slate-900 text-right ml-2">
                        {booking.dropping_point}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200/70 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid</span>
                <span className="text-2xl font-black text-slate-900">₹{Number(displayAmount || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Verified Payment Strip */}
              <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Payment Verified & Captured</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Txn: {booking?.payment_id || `pay_${(booking?.booking_ref || ref || '').toLowerCase()}`}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  {booking?.payment_method || 'Online Card/UPI'}
                </span>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || !booking}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={16} />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF E-Ticket'}</span>
            </button>

            <Link
              to={`/ticket/${booking?.booking_ref || ref}`}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-xl active:scale-98 transition-all"
            >
              <span>View Boarding Pass & E-Ticket</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/dashboard"
              className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors"
            >
              Book Another Journey
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default BookingSuccess;