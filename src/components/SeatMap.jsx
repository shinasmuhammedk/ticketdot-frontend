import React from 'react';

// Simple seat map: 10 rows, each row has seats A B (left), aisle, C D (right)
// Some seats are marked as unavailable for demo purposes.
const unavailableSeats = new Set(['2B', '5C', '7A']);

const SeatMap = ({ onSelect, selectedSeats, seatStatus }) => {
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);

  const toggleSeat = (seat) => {
    if (unavailableSeats.has(seat)) return;
    if (selectedSeats.includes(seat)) {
      onSelect(selectedSeats.filter((s) => s !== seat));
    } else {
      onSelect([...selectedSeats, seat]);
    }
  };

  const getSeatColor = (seat) => {
    if (unavailableSeats.has(seat)) return 'bg-stone-200 text-stone-400 cursor-not-allowed';
    if (selectedSeats.includes(seat)) return 'bg-[#10b981] text-white';
    if (seatStatus?.[seat] === 'locked') return 'bg-yellow-400 text-white cursor-not-allowed';
    if (seatStatus?.[seat] === 'booked') return 'bg-red-500 text-white cursor-not-allowed';
    return 'bg-green-500 text-white hover:bg-green-600';
  };

  return (
    <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
      {/* Header row showing seat letters */}
      <div className="col-span-5 text-center text-sm font-medium text-stone-500 mb-2">
        Seat Layout (Driver side on the right)
      </div>
      {rows.map((row) => (
        <React.Fragment key={row}>
          {/* Left side seats (A, B) */}
          <button
            type="button"
            onClick={() => toggleSeat(`${row}A`)}
            disabled={unavailableSeats.has(`${row}A`) || seatStatus?.[`${row}A`] === 'booked' || seatStatus?.[`${row}A`] === 'locked'}
            className={`h-10 w-10 rounded border flex items-center justify-center text-sm transition-colors ${getSeatColor(`${row}A`)}`}
          >
            {row}A
          </button>
          <button
            type="button"
            onClick={() => toggleSeat(`${row}B`)}
            disabled={unavailableSeats.has(`${row}B`) || seatStatus?.[`${row}B`] === 'booked' || seatStatus?.[`${row}B`] === 'locked'}
            className={`h-10 w-10 rounded border flex items-center justify-center text-sm transition-colors ${getSeatColor(`${row}B`)}`}
          >
            {row}B
          </button>

          {/* Aisle placeholder */}
          <div className="col-span-1"></div>

          {/* Right side seats (C, D) */}
          <button
            type="button"
            onClick={() => toggleSeat(`${row}C`)}
            disabled={unavailableSeats.has(`${row}C`) || seatStatus?.[`${row}C`] === 'booked' || seatStatus?.[`${row}C`] === 'locked'}
            className={`h-10 w-10 rounded border flex items-center justify-center text-sm transition-colors ${getSeatColor(`${row}C`)}`}
          >
            {row}C
          </button>
          <button
            type="button"
            onClick={() => toggleSeat(`${row}D`)}
            disabled={unavailableSeats.has(`${row}D`) || seatStatus?.[`${row}D`] === 'booked' || seatStatus?.[`${row}D`] === 'locked'}
            className={`h-10 w-10 rounded border flex items-center justify-center text-sm transition-colors ${getSeatColor(`${row}D`)}`}
          >
            {row}D
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default SeatMap;
