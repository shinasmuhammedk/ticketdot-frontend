import { Bus, Clock, Armchair, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusCard = ({
    scheduleID,
    operatorName,
    busType,
    departureTime,
    arrivalTime,
    duration,
    availableSeats,
    fare
}) => {

    const navigate = useNavigate();

    const handleViewSeats = () => {
        navigate(`/seat-selection?scheduleId=${scheduleID}&fare=${fare}`);
    };

    return (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                {/* Left: Operator & Bus Info */}
                <div className="flex-1 md:max-w-[200px]">
                    <h3 className="text-[17px] font-bold text-stone-900 tracking-tight">{operatorName}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-stone-500">
                        <Bus size={14} />
                        <span className="text-[13px] font-medium">{busType}</span>
                    </div>
                </div>

                {/* Center: Timeline */}
                <div className="flex-1 flex items-center justify-between md:justify-center gap-4">
                    {/* Departure */}
                    <div className="text-right flex-1 md:flex-none">
                        <p className="text-xl font-bold text-stone-900">{departureTime}</p>
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mt-0.5">Depart</p>
                    </div>

                    {/* Duration Line */}
                    <div className="flex flex-col items-center px-4 w-full md:w-32">
                        <div className="text-[11px] font-semibold text-stone-400 mb-1 flex items-center gap-1">
                            <Clock size={12} /> {duration}
                        </div>
                        <div className="relative w-full flex items-center">
                            <div className="w-2 h-2 rounded-full border-2 border-[#101F33] bg-white z-10"></div>
                            <div className="flex-1 border-t-2 border-dashed border-stone-200"></div>
                            <div className="w-2 h-2 rounded-full bg-[#E8A33D] z-10"></div>
                        </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-left flex-1 md:flex-none">
                        <p className="text-xl font-bold text-stone-900">{arrivalTime}</p>
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mt-0.5">Arrive</p>
                    </div>
                </div>

                {/* Right: Seats, Price & Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-stone-100 pt-4 md:pt-0">
                    <div className="flex flex-col items-start md:items-end mb-0 md:mb-3">
                        <div className="text-2xl font-bold text-[#101F33] tracking-tight">
                            ${fare.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase">
                            <Armchair size={12} />
                            {availableSeats} Seats Left
                        </div>
                    </div>

                    <button
                        onClick={handleViewSeats}
                        className="h-10 px-6 rounded-lg bg-[#101F33] text-white text-[14px] font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-[#1A2D47] active:scale-[0.98]"
                    >
                        View Seats
                        <ChevronRight size={16} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BusCard;
