import React from 'react';

const SeatMap = ({ onSelect, selectedSeats, seatStatus }) => {
  const rows = Object.keys(seatStatus).sort();

  const toggleSeat = (seat) => {
    const status = seatStatus?.[seat];

    if (status === 'booked' || status === 'locked') return;

    if (selectedSeats.includes(seat)) {
      onSelect(selectedSeats.filter((s) => s !== seat));
    } else {
      onSelect([seat]); // only one seat for now
    }
  };

  const getSeatColor = (seat) => {
    const status = seatStatus?.[seat];

    if (selectedSeats.includes(seat)) return 'bg-[#10b981] text-white';
    if (status === 'locked') return 'bg-yellow-400 text-white cursor-not-allowed';
    if (status === 'booked') return 'bg-red-500 text-white cursor-not-allowed';

    return 'bg-green-500 text-white hover:bg-green-600';
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center text-sm font-medium text-stone-500 mb-4">
        Seat Layout
      </div>

      <div className="grid grid-cols-4 gap-3">
        {rows.map((seat) => (
          <button
            key={seat}
            type="button"
            onClick={() => toggleSeat(seat)}
            disabled={seatStatus?.[seat] === 'booked' || seatStatus?.[seat] === 'locked'}
            className={`h-11 w-14 rounded border flex items-center justify-center text-sm font-medium transition-colors ${getSeatColor(seat)}`}
          >
            {seat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;