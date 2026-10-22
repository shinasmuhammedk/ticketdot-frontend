import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getSeats } from '../api/seats';
import { getBusDetails } from '../api/buses';
import {
  ArrowLeft, Bus, Clock, Armchair, Lock, CheckCircle2,
  ChevronRight, AlertCircle, Timer, ShieldCheck, RotateCcw,
  MapPin, CreditCard, User, Mail, Phone, Users
} from 'lucide-react';
import SeatMap from '../components/SeatMap';
import { lockSeat, confirmBooking, releaseSeats } from '../api/bookings';
import Toast from './Toast';
import Navbar from '../components/Navbar';
import PaymentModal from '../components/PaymentModal';
import { formatINR } from '../utils/formatINR';

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Boarding & Dropping Points
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');

  // Per-seat passenger details & contact info
  const [passengerDetails, setPassengerDetails] = useState({});
  const [contactPhone, setContactPhone] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.phone || '';
    } catch {
      return '';
    }
  });
  const [contactEmail, setContactEmail] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.email || '';
    } catch {
      return '';
    }
  });

  const userLockedSeatsRef = useRef(userLockedSeats);
  const scheduleIdRef = useRef(scheduleId);
  const bookingConfirmedRef = useRef(false);

  useEffect(() => {
    userLockedSeatsRef.current = userLockedSeats;
  }, [userLockedSeats]);

  useEffect(() => {
    scheduleIdRef.current = scheduleId;
  }, [scheduleId]);

  // Derive passenger rows directly from userLockedSeats and passengerDetails
  const passengers = useMemo(() => {
    if (!userLockedSeats || userLockedSeats.length === 0) {
      return [];
    }

    const cachedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })();

    return userLockedSeats.map((seatNum, idx) => {
      const existing = passengerDetails[seatNum];
      return {
        seat_number: seatNum,
        name: existing?.name !== undefined ? existing.name : (idx === 0 ? (cachedUser.name || '') : ''),
        age: existing?.age !== undefined ? existing.age : '',
        gender: existing?.gender || 'Male',
      };
    });
  }, [userLockedSeats, passengerDetails]);

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
          const t = tripRes.value.data.data;
          setTrip(t);
          setBoardingPoint(`${t.origin} Central Bus Station`);
          setDroppingPoint(`${t.destination} Main Terminal`);
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
      return;
    }

    const calcRemaining = () => {
      return Math.max(0, Math.floor((new Date(lockExpires).getTime() - Date.now()) / 1000));
    };

    const interval = setInterval(() => {
      const remaining = calcRemaining();
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setUserLockedSeats([]);
        setLockExpires(null);
        setCountdown(0);
        loadSeats();
        setToastMessage('Seat lock expired. Please select and lock seats again.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpires]);

  const fare = trip?.base_fare_paise ?? trip?.base_fare ?? paramFare ?? 0;
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
      if (expiry) {
        setCountdown(Math.max(0, Math.floor((new Date(expiry).getTime() - Date.now()) / 1000)));
      }
      setSelectedSeats([]);
      setToastMessage(`Seats locked! Fill passenger details to complete your reservation.`);

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
      setCountdown(0);
      await loadSeats();
      setToastMessage('Released held seats.');
    } catch (err) {
      setToastMessage('Failed to release seats');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePassengerChange = (seatNumber, field, value) => {
    setPassengerDetails((prev) => {
      const current = prev[seatNumber] || {};
      return {
        ...prev,
        [seatNumber]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleOpenPaymentModal = () => {
    if (userLockedSeats.length === 0) {
      setToastMessage('Please select and lock seats first');
      return;
    }

    // Validate passenger details
    for (const p of passengers) {
      if (!p.name || !p.name.trim()) {
        setToastMessage(`Please enter passenger name for Seat ${p.seat_number}`);
        return;
      }
      if (p.age && (Number(p.age) < 1 || Number(p.age) > 120)) {
        setToastMessage(`Please enter a valid age for Seat ${p.seat_number}`);
        return;
      }
    }

    if (!contactPhone || !contactPhone.trim()) {
      setToastMessage('Please enter contact mobile number for ticket SMS/dispatch');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (bookingData) => {
    bookingConfirmedRef.current = true;
    setShowPaymentModal(false);
    const bookingRef = bookingData?.booking_ref;
    navigate(`/booking-success?ref=${bookingRef}`);
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
                <p className="text-xl font-black text-indigo-600">{formatINR(fare)}</p>
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

              <div className="py-5 space-y-5">
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

                {/* Passenger Information Inputs (When Seats Are Locked) */}
                {isLockedState && (
                  <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Users size={14} className="text-indigo-600" />
                        <span>Passenger Manifest</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">As on Govt ID</span>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {passengers.map((p, idx) => (
                        <div key={p.seat_number} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                              <Armchair size={13} />
                              Seat {p.seat_number}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Passenger {idx + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-7">
                              <input
                                type="text"
                                placeholder="Full Name"
                                value={p.name}
                                onChange={(e) => handlePassengerChange(p.seat_number, 'name', e.target.value)}
                                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                              />
                            </div>
                            <div className="sm:col-span-5">
                              <input
                                type="number"
                                placeholder="Age"
                                min="1"
                                max="120"
                                value={p.age}
                                onChange={(e) => handlePassengerChange(p.seat_number, 'age', e.target.value)}
                                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1 pt-1">
                            {['Male', 'Female', 'Other'].map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => handlePassengerChange(p.seat_number, 'gender', g)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                  p.gender === g
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Contact details for Ticket Dispatch */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Ticket Dispatch Contact
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative">
                          <Phone size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="Mobile No."
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full h-8 pl-7 pr-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                        <div className="relative">
                          <Mail size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full h-8 pl-7 pr-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boarding & Dropping Points Selector */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                      <MapPin size={12} className="text-indigo-600" />
                      <span>Boarding Point</span>
                    </label>
                    <select
                      value={boardingPoint}
                      onChange={(e) => setBoardingPoint(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-colors"
                    >
                      <option value={`${trip?.origin || 'Origin'} Central Bus Station`}>
                        {trip?.origin || 'Origin'} Central Bus Station (Main Gate)
                      </option>
                      <option value={`${trip?.origin || 'Origin'} Highway Junction`}>
                        {trip?.origin || 'Origin'} Highway Junction (Toll Plaza)
                      </option>
                      <option value={`${trip?.origin || 'Origin'} Airport Bypass`}>
                        {trip?.origin || 'Origin'} Airport Bypass Circle
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                      <MapPin size={12} className="text-emerald-600" />
                      <span>Dropping Point</span>
                    </label>
                    <select
                      value={droppingPoint}
                      onChange={(e) => setDroppingPoint(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-colors"
                    >
                      <option value={`${trip?.destination || 'Destination'} Main Terminal`}>
                        {trip?.destination || 'Destination'} Main Terminal (Platform 1)
                      </option>
                      <option value={`${trip?.destination || 'Destination'} City Center Ring`}>
                        {trip?.destination || 'Destination'} City Center Ring Road
                      </option>
                      <option value={`${trip?.destination || 'Destination'} Suburb Express Stop`}>
                        {trip?.destination || 'Destination'} Suburb Express Stop
                      </option>
                    </select>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Fare ({activeSeats.length} seat{activeSeats.length !== 1 ? 's' : ''} × {formatINR(fare)})</span>
                    <span className="font-semibold text-slate-700">{formatINR(totalFare)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Taxes & Operator fees</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Total Payable</span>
                    <span className="text-3xl font-black text-slate-900">{formatINR(totalFare)}</span>
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
                      onClick={handleOpenPaymentModal}
                      disabled={actionLoading}
                      type="button"
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
                    >
                      <CreditCard size={16} />
                      {actionLoading ? 'Confirming...' : `Proceed to Payment (${formatINR(totalFare)})`}
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

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        scheduleId={scheduleId}
        trip={trip}
        seats={activeSeats}
        fare={fare}
        totalAmount={totalFare}
        passengers={passengers}
        boardingPoint={boardingPoint}
        droppingPoint={droppingPoint}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SeatSelection;