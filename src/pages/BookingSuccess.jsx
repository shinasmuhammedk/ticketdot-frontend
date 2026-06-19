import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();

  const seat = searchParams.get('seat');
  const fare = searchParams.get('fare');
  const bookingRef = searchParams.get('bookingRef');

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Booking Confirmed!
        </h1>

        <p className="text-stone-500 mb-6">
          Your bus ticket has been booked successfully.
        </p>

        <div className="bg-stone-50 rounded-xl p-5 text-left space-y-3 mb-6">
          {bookingRef && (
            <div className="flex justify-between">
              <span className="text-stone-500">Booking Ref</span>
              <span className="font-semibold text-stone-900">{bookingRef}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-stone-500">Seat</span>
            <span className="font-semibold text-stone-900">{seat || '-'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">Amount</span>
            <span className="font-semibold text-stone-900">₹{fare || 0}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">Status</span>
            <span className="font-semibold text-emerald-600">Confirmed</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/my-bookings"
            className="flex-1 h-11 rounded-xl bg-[#101F33] text-white flex items-center justify-center font-medium"
          >
            My Bookings
          </Link>

          <Link
            to="/dashboard"
            className="flex-1 h-11 rounded-xl border border-stone-200 text-[#101F33] flex items-center justify-center font-medium"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;