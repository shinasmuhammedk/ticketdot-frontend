import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getSeats } from '../api/seats';
import { ArrowLeft, Bus, Clock, Armchair, Lock, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';
import SeatMap from '../components/SeatMap';
import { lockSeat, confirmBooking } from '../api/bookings';

/**
 * MINIMAL THEME — Inspired by Google Material You
 * Clean, airy, purposeful whitespace. No decorative noise.
 */
const SeatSelection = () => {
    const [searchParams] = useSearchParams();

    const scheduleId = searchParams.get('scheduleId');
    const fare = Number(searchParams.get('fare') || 0);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatStatus, setSeatStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const lockedSeats = Object.entries(seatStatus)
        .filter(([, status]) => status?.toLowerCase() === 'locked')
        .map(([seat]) => seat);

    const selectedFare = selectedSeats.length * fare;
    const lockedFare = lockedSeats.length * fare;
    const navigate = useNavigate();

    const handleLockSeats = async () => {
        try {
            const seat = selectedSeats[0];
            await lockSeat(scheduleId, seat);
            
            const updated = await getSeats(scheduleId);
            const statusMap = {};
            updated.data.data.forEach((seat) => {
                statusMap[seat.seat_number] = seat.status;
            });
            setSeatStatus(statusMap);
            setSelectedSeats([]);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to lock seat');
        }
    };

    const handleConfirmBooking = async () => {
        try {
            const seat = lockedSeats[0];
            if (!seat) {
                alert('Please lock a seat first');
                return;
            }
            await confirmBooking(scheduleId, seat);
            navigate(`/booking-success?seat=${seat}&fare=${fare}`);
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to confirm booking');
        }
    };

    useEffect(() => {
        const loadSeats = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getSeats(scheduleId);
                const statusMap = {};
                (res.data.data || []).forEach((seat) => {
                    statusMap[seat.seat_number] = seat.status;
                });
                setSeatStatus(statusMap);
            } catch (err) {
                setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load seats');
            } finally {
                setLoading(false);
            }
        };
        if (scheduleId) loadSeats();
    }, [scheduleId]);

    const totalFare = selectedFare || lockedFare;

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Top Bar — clean, minimal */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
                    <Link 
                        to="/dashboard" 
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} strokeWidth={1.5} />
                        <span className="hidden sm:inline">Back</span>
                    </Link>
                    <div className="h-4 w-px bg-gray-200" />
                    <h1 className="text-sm font-medium text-gray-900">Select seats</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left — Seat Map (8 cols) */}
                    <div className="lg:col-span-8">
                        {/* Trip summary card */}
                        <div className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                    <Bus size={18} className="text-gray-700" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                        <span>08:30 AM</span>
                                        <ChevronRight size={14} className="text-gray-400" />
                                        <span>12:45 PM</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Acme Travels · Semi-Sleeper · ~4h 15m</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">₹{fare}</p>
                                    <p className="text-[11px] text-gray-400">per seat</p>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-5 mb-4 px-1">
                            <LegendItem color="bg-white" border="border-gray-300" label="Available" />
                            <LegendItem color="bg-blue-600" label="Selected" />
                            <LegendItem color="bg-amber-400" label="Locked" />
                            <LegendItem color="bg-gray-200" label="Booked" />
                        </div>

                        {/* Seat Map Container */}
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                            {loading && (
                                <div className="py-20 text-center">
                                    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-gray-400">Loading seats...</p>
                                </div>
                            )}
                            
                            {error && (
                                <div className="p-6 text-center">
                                    <p className="text-sm text-red-600 bg-red-50 rounded-lg py-3 px-4 inline-block">{error}</p>
                                </div>
                            )}

                            {!loading && !error && (
                                <div className="p-6 sm:p-8">
                                    <SeatMap
                                        selectedSeats={selectedSeats}
                                        onSelect={setSelectedSeats}
                                        seatStatus={seatStatus}
                                    />
                                    <p className="text-center text-xs text-gray-400 mt-6 font-medium tracking-wide uppercase">
                                        Front of bus
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right — Checkout Panel (4 cols) */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-24 space-y-4">
                            
                            {/* Selection Summary */}
                            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-50">
                                    <h2 className="text-sm font-semibold text-gray-900">Your selection</h2>
                                </div>
                                
                                <div className="p-5 space-y-4">
                                    {/* Selected seats */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Armchair size={16} className="text-gray-400" strokeWidth={1.5} />
                                            <span className="text-sm text-gray-600">Seats</span>
                                        </div>
                                        <div className="text-right">
                                            {selectedSeats.length > 0 ? (
                                                <div className="flex gap-1.5 flex-wrap justify-end">
                                                    {selectedSeats.map(s => (
                                                        <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">None</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Locked seats */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Lock size={15} className="text-gray-400" strokeWidth={1.5} />
                                            <span className="text-sm text-gray-600">Locked</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {lockedSeats.length > 0 ? lockedSeats.join(', ') : 'None'}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Total</span>
                                            <span className="text-xl font-semibold text-gray-900">₹{totalFare}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2.5">
                                <button
                                    onClick={handleLockSeats}
                                    disabled={selectedSeats.length === 0}
                                    className="w-full h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2 
                                        bg-white border border-gray-200 text-gray-700
                                        hover:bg-gray-50 hover:border-gray-300
                                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200
                                        transition-all duration-200"
                                >
                                    <Lock size={15} strokeWidth={1.5} />
                                    Lock seat{selectedSeats.length !== 1 ? 's' : ''}
                                </button>
                                
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={lockedSeats.length === 0}
                                    className="w-full h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2
                                        bg-blue-600 text-white
                                        hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20
                                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-none
                                        transition-all duration-200"
                                >
                                    <CheckCircle2 size={15} strokeWidth={1.5} />
                                    Confirm booking
                                </button>
                            </div>

                            {/* Trust hint */}
                            <p className="text-center text-[11px] text-gray-400 px-4">
                                Seats are held for 10 minutes after locking
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const LegendItem = ({ color, label, border }) => (
    <div className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded-md ${color} ${border ? border + ' border' : ''}`} />
        <span className="text-xs text-gray-500">{label}</span>
    </div>
);

export default SeatSelection;