import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeatMap from '../components/SeatMap';

// Assuming a base fare per seat (could be passed via props or context)
const BASE_FARE = 12.5; // $12.50 per seat

const SeatSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  // seatStatus maps seat identifier to status: 'available' | 'locked' | 'booked'
  const [seatStatus, setSeatStatus] = useState({});

  const lockedSeats = Object.entries(seatStatus)
    .filter(([, status]) => status === 'locked')
    .map(([seat]) => seat);
  const totalFare = (lockedSeats.length * BASE_FARE).toFixed(2);

  const handleLockSeats = () => {
    const newStatus = { ...seatStatus };
    selectedSeats.forEach((seat) => {
      newStatus[seat] = 'locked';
    });
    setSeatStatus(newStatus);
    setSelectedSeats([]);
  };

  const handleConfirmBooking = () => {
    const newStatus = { ...seatStatus };
    Object.keys(newStatus).forEach((seat) => {
      if (newStatus[seat] === 'locked') {
        newStatus[seat] = 'booked';
      }
    });
    setSeatStatus(newStatus);
    alert('Booking confirmed!');
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2.5 text-[#101F33] hover:text-[#E8A33D] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-lg font-semibold">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Bus Details Placeholder */}
        <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-sm border border-stone-100 mb-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Bus Details</h2>
          <p className="text-sm text-stone-600">Operator: <span className="font-medium">Acme Travels</span></p>
          <p className="text-sm text-stone-600">Type: <span className="font-medium">Semi‑Sleeper</span></p>
          <p className="text-sm text-stone-600">Departure: <span className="font-medium">08:30 AM</span></p>
          <p className="text-sm text-stone-600">Arrival: <span className="font-medium">12:45 PM</span></p>
          <p className="text-sm text-stone-600">Fare per seat: <span className="font-medium">${BASE_FARE.toFixed(2)}</span></p>
        </div>

        <h1 className="text-2xl font-semibold text-stone-900 mb-4">Select Your Seats</h1>
        <p className="text-sm text-stone-500 mb-4">
          Click on an available seat to select it. Selected seats appear in emerald. Locked seats are yellow, booked seats are red.
        </p>

        {/* Seat Map */}
            <SeatMap
              selectedSeats={selectedSeats}
              onSelect={setSelectedSeats}
              seatStatus={seatStatus}
            />

        {/* Summary Panel */}
        <div className="mt-8 w-full max-w-md bg-white rounded-xl p-6 shadow-sm border border-stone-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-700 font-medium">Seats Selected:</span>
            <span className="text-stone-900 font-semibold">{selectedSeats.length}</span>
          </div>
          {selectedSeats.length > 0 && (
            <div className="mb-4">
              <span className="text-stone-700 font-medium">Selected Seats:</span>
              <p className="text-stone-800">{selectedSeats.join(', ')}</p>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-700 font-medium">Locked Seats:</span>
            <span className="text-stone-900 font-semibold">{lockedSeats.length}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-700 font-medium">Total Fare:</span>
            <span className="text-stone-900 font-semibold">${totalFare}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleLockSeats}
              disabled={selectedSeats.length === 0}
              className="flex-1 h-12 rounded-xl bg-emerald-600 text-white font-medium transition-colors hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Lock Seats
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={lockedSeats.length === 0}
              className="flex-1 h-12 rounded-xl bg-[#101F33] text-white font-medium transition-colors hover:bg-[#1A2D47] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
