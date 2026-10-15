import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getSeats } from '../api/seats';
import { getBusDetails } from '../api/buses';
import {
  ArrowLeft, Bus, Clock, Armchair, Lock, CheckCircle2,
  ChevronRight, AlertCircle, Timer, ShieldCheck, RotateCcw
} from 'lucide-react';
import SeatMap from '../components/SeatMap';
import { lockSeat, confirmBooking, releaseSeats } from '../api/bookings';
import Toast from './Toast';
import Navbar from '../components/Navbar';

const SeatSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const scheduleId = searchParams.get('scheduleId');
  const paramFare = Number(searchParams.get('fare') || 0);

  const [trip, setTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [userLockedSeats, setUserLockedSeats] = useState([]);
  const [seatStatus, setSeatStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [lockExpires, setLockExpires] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const userLockedSeatsRef = useRef(userLockedSeats);
  const scheduleIdRef = useRef(scheduleId);
  const bookingConfirmedRef = useRef(false);

  useEffect(() => {
    userLockedSeatsRef.current = userLockedSeats;
  }, [userLockedSeats]);

  useEffect(() => {
    scheduleIdRef.current = scheduleId;
  }, [scheduleId]);

  // Release locks on component unmount (if not confirmed)
  useEffect(() => {
    return () => {
      if (
        userLockedSeatsRef.current &&
        userLockedSeatsRef.current.length > 0 &&
        !bookingConfirmedRef.current &&
        scheduleIdRef.current
      ) {
        releaseSeats(scheduleIdRef.current, userLockedSeatsRef.current).catch(() => {});
      }
    };
  }, []);

  // Load seat inventory
  const loadSeats = async () => {
    if (!scheduleId) return;
    try {
      const res = await getSeats(scheduleId);
      const statusMap = {};
      (res.data.data || []).forEach((seat) => {
        statusMap[seat.seat_number] = seat.status;
      });
      setSeatStatus(statusMap);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load seats');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const [tripRes, seatsRes] = await Promise.allSettled([
          getBusDetails(scheduleId),
          getSeats(scheduleId),
        ]);

        if (tripRes.status === 'fulfilled' && tripRes.value.data?.data) {
          setTrip(tripRes.value.data.data);
        }

        if (seatsRes.status === 'fulfilled' && seatsRes.value.data?.data) {
          const statusMap = {};
          seatsRes.value.data.data.forEach((seat) => {
            statusMap[seat.seat_number] = seat.status;
          });
          setSeatStatus(statusMap);
        } else if (seatsRes.status === 'rejected') {
          setError('Failed to load seat layout');
        }
      } catch (err) {
        setError('Failed to load schedule data');
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      loadInitialData();
    }
  }, [scheduleId]);

  // Countdown timer for locked seats
  useEffect(() => {
    if (!lockExpires) {
      setCountdown(0);
      return;
    }

    const calcRemaining = () => {
      return Math.max(0, Math.floor((new Date(lockExpires).getTime() - Date.now()) / 1000));
    };

    setCountdown(calcRemaining());

    const interval = setInterval(() => {
      const remaining = calcRemaining();
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setUserLockedSeats([]);
        setLockExpires(null);
        loadSeats();
        setToastMessage('Seat lock expired. Please select and lock seats again.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpires]);

  const fare = trip?.base_fare || paramFare || 0;
  const isLockedState = userLockedSeats.length > 0;
  const activeSeats = isLockedState ? userLockedSeats : selectedSeats;
  const totalFare = activeSeats.length * fare;

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatTripTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  const getDurationText = () => {
    if (!trip?.departure_time || !trip?.arrival_time) return null;
    try {
      const diffMs = new Date(trip.arrival_time) - new Date(trip.departure_time);
      if (diffMs <= 0) return null;
      const diffMins = Math.round(diffMs / 60000);
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hrs}h ${mins}m`;
    } catch {
      return null;
    }
  };

  const handleBack = async () => {
    if (userLockedSeats.length > 0 && scheduleId) {
      try {
        await releaseSeats(scheduleId, userLockedSeats);
        userLockedSeatsRef.current = [];
      } catch {
        // Ignore release errors on back
      }
    }
    navigate(-1);
  };

  const handleLockSeats = async () => {
    if (selectedSeats.length === 0) return;
    setActionLoading(true);
    try {
      const res = await lockSeat(scheduleId, selectedSeats);
      const data = res.data?.data;
      const expiry = data?.lock_expires;

      setUserLockedSeats(selectedSeats);
      setLockExpires(expiry);
      setSelectedSeats([]);
      setToastMessage(`Seats locked! Complete your booking within 5 minutes.`);

      await loadSeats();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to lock seats';
      setToastMessage(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseSeats = async () => {
    if (userLockedSeats.length === 0) return;
    setActionLoading(true);
    try {
      await releaseSeats(scheduleId, userLockedSeats);
      setUserLockedSeats([]);
      setLockExpires(null);
      await loadSeats();
      setToastMessage('Released held seats.');
    } catch (err) {
      setToastMessage('Failed to release seats');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (userLockedSeats.length === 0) {
      setToastMessage('Please lock your selected seats first');
      return;
    }

    setActionLoading(true);
    try {
      const res = await confirmBooking(scheduleId, userLockedSeats);
      bookingConfirmedRef.current = true;
      const bookingRef = res.data?.data?.booking_ref;
      navigate(`/booking-success?ref=${bookingRef}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to confirm booking';
      setToastMessage(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLimitReached = () => {
    setToastMessage('You can select a maximum of 6 seats at once');
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

      {/* Breadcrumb Header Bar */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={handleBack}
            type="button"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Back to buses</span>
          </button>

          {isLockedState && countdown > 0 && (
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              countdown <= 60
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <Timer size={14} className={countdown <= 60 ? 'text-red-500' : 'text-amber-600'} />
              <span>Lock expires in {formatCountdown(countdown)}</span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Dynamic Route Banner Card */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Bus size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{trip?.origin || 'Origin'}</span>
                  <span className="text-indigo-500 font-normal">→</span>
                  <span>{trip?.destination || 'Destination'}</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {trip?.operator_name || 'Express Line'} • <span className="font-semibold text-slate-700">{trip?.bus_type?.replaceAll('_', ' ')}</span>
                  {getDurationText() && ` • ~${getDurationText()}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Departure</p>
                <p className="text-base font-black text-slate-900">{formatTripTime(trip?.departure_time)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Arrival</p>
                <p className="text-base font-black text-slate-900">{formatTripTime(trip?.arrival_time)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Base Fare</p>
                <p className="text-xl font-black text-indigo-600">₹{fare}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace: Seat Map + Summary Checkout Dock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Seat Map Column */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-800">Loading seat map...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-3xl p-8 text-center border border-red-200">
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            ) : (
              <SeatMap
                selectedSeats={selectedSeats}
                onSelect={setSelectedSeats}
                seatStatus={seatStatus}
                onLimitReached={handleLimitReached}
              />
            )}
          </div>

          {/* Sticky Checkout Dock */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
                <span>Reservation Summary</span>
                <span className="text-xs font-semibold text-slate-400">Max 6 seats</span>
              </h2>

              <div className="py-5 space-y-4">
                {/* Active Seats List */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Selected Seats:</span>
                    <span className="text-slate-400">{activeSeats.length} / 6</span>
                  </div>

                  {activeSeats.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Click available seats on the map to add them to your trip.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {activeSeats.map((s) => (
                        <div
                          key={s}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs ${
                            isLockedState
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          <Armchair size={13} />
                          <span>Seat {s}</span>
                          {!isLockedState && (
                            <button
                              type="button"
                              onClick={() => setSelectedSeats(selectedSeats.filter((seat) => seat !== s))}
                              className="hover:text-red-600 transition-colors cursor-pointer ml-1"
                              title="Remove seat"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Fare ({activeSeats.length} seat{activeSeats.length !== 1 ? 's' : ''} × ₹{fare})</span>
                    <span className="font-semibold text-slate-700">₹{totalFare}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Taxes & Operator fees</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Total Payable</span>
                    <span className="text-3xl font-black text-slate-900">₹{totalFare}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isLockedState ? (
                  <button
                    onClick={handleLockSeats}
                    disabled={selectedSeats.length === 0 || actionLoading}
                    type="button"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Lock size={16} />
                    {actionLoading
                      ? 'Locking Seats...'
                      : `Lock & Proceed (${selectedSeats.length} seat${selectedSeats.length !== 1 ? 's' : ''})`}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={actionLoading}
                      type="button"
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      {actionLoading ? 'Confirming...' : `Confirm Booking (Pay ₹${totalFare})`}
                    </button>

                    <button
                      onClick={handleReleaseSeats}
                      disabled={actionLoading}
                      type="button"
                      className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      Release Held Seats
                    </button>
                  </>
                )}
              </div>

              {/* Security Tag */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Encrypted 256-bit checkout • Guaranteed reservation</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default SeatSelection;