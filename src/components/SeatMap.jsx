import React from 'react';
import { Armchair, Lock, Check, Disc } from 'lucide-react';

const SeatMap = ({ onSelect, selectedSeats = [], seatStatus = {}, onLimitReached }) => {
  // Extract all seat numbers and sort them logically (e.g. A1, A2, B1, C1...)
  const seatKeys = Object.keys(seatStatus);

  // Group seats by row number if seats follow pattern like A1, A2, B1 etc., or numerical rows
  // If seats are named like A1, B1, C1, D1 (columns across row 1)
  // Let's inspect how seats are named. In our DB:
  // Route 1 (Mumbai-Pune): A1, A2, A3, A4, B1, B2, B3, B4
  // Route 2 (Bengaluru-Chennai): A1, B1, C1, D1, A2, B2, C2, D2 ...
  
  // Let's create an organized grid layout:
  // Sort seats: group by row or number
  const sortedSeats = [...seatKeys].sort((a, b) => {
    // If seat has letter + number (e.g., A1, B2)
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    const charA = a.replace(/[0-9]/g, '');
    const charB = b.replace(/[0-9]/g, '');

    if (numA !== numB) return numA - numB;
    return charA.localeCompare(charB);
  });

  const getStatus = (seat) => {
    return seatStatus?.[seat]?.toLowerCase();
  };

  const toggleSeat = (seat) => {
    const status = getStatus(seat);
    if (status === 'booked' || status === 'locked') return;

    if (selectedSeats.includes(seat)) {
      onSelect(selectedSeats.filter((s) => s !== seat));
    } else {
      if (selectedSeats.length >= 6) {
        if (onLimitReached) onLimitReached();
        return;
      }
      onSelect([...selectedSeats, seat]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Visual Status Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 px-5 mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white border-2 border-slate-300 shadow-xs" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 border-2 border-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Check size={13} strokeWidth={3} />
          </div>
          <span className="font-semibold text-indigo-900">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600">
            <Lock size={12} />
          </div>
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-200 border-2 border-slate-200 flex items-center justify-center text-slate-400">
            <span className="text-[10px] font-bold">✕</span>
          </div>
          <span>Booked</span>
        </div>
      </div>

      {/* Bus Cabin Frame */}
      <div className="relative bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-md p-6 sm:p-8">
        {/* Front of Bus Header */}
        <div className="pb-6 mb-6 border-b-2 border-dashed border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 uppercase tracking-wider font-bold">Front of Bus</span>
          </div>

          {/* Steering Wheel / Driver Area */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600">
            <Disc size={18} className="animate-spin-slow text-slate-500" />
            <span className="text-[11px] font-medium">Driver Area</span>
          </div>
        </div>

        {/* Seat Grid with Central Walkway Aisle */}
        {sortedSeats.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading seat configuration...
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-sm mx-auto">
            {sortedSeats.map((seat, index) => {
              const status = getStatus(seat);
              const isSelected = selectedSeats.includes(seat);
              const isLocked = status === 'locked';
              const isBooked = status === 'booked';
              const isAvailable = !isLocked && !isBooked;

              // Insert walkway visual gap between column 2 and 3
              const isAisleEdge = (index % 4 === 1);

              return (
                <div
                  key={seat}
                  className={`flex justify-center ${isAisleEdge ? 'mr-3 sm:mr-4' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSeat(seat)}
                    disabled={!isAvailable}
                    aria-label={`Seat ${seat} - ${isSelected ? 'Selected' : status}`}
                    className={`
                      relative group w-13 h-14 sm:w-14 sm:h-15 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all duration-150 select-none
                      ${isSelected
                        ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400 ring-offset-2'
                        : isLocked
                        ? 'bg-amber-50 border-2 border-amber-300 text-amber-700 cursor-not-allowed opacity-80'
                        : isBooked
                        ? 'bg-slate-100 border-2 border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                      }
                    `}
                  >
                    {/* Seat Headrest Pill */}
                    <div
                      className={`
                        w-7 h-2 rounded-full transition-colors
                        ${isSelected ? 'bg-indigo-300' : isLocked ? 'bg-amber-300' : isBooked ? 'bg-slate-200' : 'bg-slate-200 group-hover:bg-indigo-200'}
                      `}
                    />

                    {/* Seat Number & Icon */}
                    <div className="flex items-center justify-center font-bold text-xs tracking-tight">
                      {isLocked ? (
                        <Lock size={12} className="text-amber-500" />
                      ) : isBooked ? (
                        <span className="text-[11px] font-semibold text-slate-400">{seat}</span>
                      ) : isSelected ? (
                        <span className="text-xs font-bold text-white flex items-center gap-0.5">
                          {seat}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">{seat}</span>
                      )}
                    </div>

                    {/* Armrest Base Line */}
                    <div
                      className={`
                        w-9 h-1 rounded-full transition-colors
                        ${isSelected ? 'bg-indigo-400' : isLocked ? 'bg-amber-200' : isBooked ? 'bg-slate-200' : 'bg-slate-100 group-hover:bg-indigo-100'}
                      `}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Rear of Bus */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Rear of Bus
          </span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;