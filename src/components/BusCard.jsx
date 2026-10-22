import React from 'react';
import { Bus, Clock, Armchair, ChevronRight, Star, Wifi, Zap, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/formatINR';

const BusCard = ({
    scheduleID,
    busId,
    operatorName,
    busType,
    departureTime,
    arrivalTime,
    duration,
    availableSeats,
    fare,
    rating,
    reviewCount,
    onOpenReviews
}) => {
    const navigate = useNavigate();

    const handleViewSeats = () => {
        navigate(`/seat-selection?scheduleId=${scheduleID}&fare=${fare}`);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        const d = new Date(timeStr);
        if (isNaN(d.getTime())) return timeStr;
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const displayDuration = () => {
        if (duration) return duration;
        if (!departureTime || !arrivalTime) return '--';
        const diffMs = new Date(arrivalTime) - new Date(departureTime);
        if (diffMs <= 0 || isNaN(diffMs)) return '--';
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.round((diffMs % 3600000) / 60000);
        return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
    };

    const formattedBusType = busType ? busType.replaceAll('_', ' ') : 'Standard Bus';
    const isLowAvailability = availableSeats > 0 && availableSeats <= 8;

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                {/* Left: Operator & Bus Info */}
                <div className="flex-1 lg:max-w-xs">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {operatorName || 'Express Travels'}
                        </h3>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenReviews) {
                                    onOpenReviews({ busId, operatorName, busType });
                                }
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            title="Click to view verified passenger ratings and reviews"
                        >
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span>{rating ? Number(rating).toFixed(1) : '4.6'}</span>
                            <span className="text-[10px] text-amber-600 font-normal">
                                ({reviewCount != null ? reviewCount : 12})
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-xs font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                            {formattedBusType}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>Daily Express</span>
                    </div>

                    {/* Amenities tags */}
                    <div className="flex items-center gap-3 mt-3 text-slate-400 text-xs">
                        <span className="flex items-center gap-1 hover:text-slate-600 transition-colors" title="Air Conditioned">
                            <Wind size={13} /> AC
                        </span>
                        <span className="flex items-center gap-1 hover:text-slate-600 transition-colors" title="Free Wi-Fi">
                            <Wifi size={13} /> Wi-Fi
                        </span>
                        <span className="flex items-center gap-1 hover:text-slate-600 transition-colors" title="Charging Points">
                            <Zap size={13} /> Power
                        </span>
                    </div>
                </div>

                {/* Center: Timeline */}
                <div className="flex-1 flex items-center justify-between sm:justify-center gap-4 sm:gap-8 px-2">
                    {/* Departure */}
                    <div className="text-left sm:text-right">
                        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatTime(departureTime)}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Departure</p>
                    </div>

                    {/* Duration Line */}
                    <div className="flex flex-col items-center px-2 w-28 sm:w-36">
                        <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            <Clock size={12} className="text-indigo-600" /> {displayDuration()}
                        </div>
                        <div className="relative w-full flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-indigo-600 bg-white z-10" />
                            <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 z-10" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Direct</span>
                    </div>

                    {/* Arrival */}
                    <div className="text-right sm:text-left">
                        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatTime(arrivalTime)}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Arrival</p>
                    </div>
                </div>

                {/* Right: Seats, Price & Action */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                    <div className="flex flex-col items-start lg:items-end lg:mb-3">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                                {formatINR(fare)}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">/ seat</span>
                        </div>

                        {/* Availability Pill */}
                        <div className={`flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                            isLowAvailability
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                                : availableSeats === 0
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                            <Armchair size={12} />
                            {availableSeats === 0 ? 'Sold Out' : `${availableSeats} Seats Left`}
                        </div>
                    </div>

                    <button
                        onClick={handleViewSeats}
                        disabled={availableSeats === 0}
                        className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Select Seats
                        <ChevronRight size={16} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BusCard;
