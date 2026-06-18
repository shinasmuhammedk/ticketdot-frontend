import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Clock } from 'lucide-react';

const bookings = [
  {
    id: 1,
    operator: 'Acme Travels',
    type: 'Semi‑Sleeper',
    departure: '08:30 AM',
    arrival: '12:45 PM',
    date: '2026-07-15',
    fare: 45.0,
    seat: '14A',
    status: 'Upcoming',
  },
  {
    id: 2,
    operator: 'MegaBus',
    type: 'Premium',
    departure: '02:00 PM',
    arrival: '06:30 PM',
    date: '2026-06-20',
    fare: 28.5,
    seat: '4C',
    status: 'Completed',
  },
];

const MyBookings = () => {
  return (
    <div className="min-h-screen bg-stone-50 font-sans py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">My Bookings</h1>
      <div className="space-y-6">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Bus size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">{b.operator} – {b.type}</h2>
                <p className="text-sm text-stone-500">{b.date} • {b.departure} → {b.arrival}</p>
                <p className="text-sm text-stone-500">Seat {b.seat}</p>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end space-y-2">
              <div className="text-lg font-bold text-stone-900">${b.fare.toFixed(2)}</div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${b.status === 'Upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                {b.status}
              </span>
              <Link to="/dashboard" className="text-sm text-[#101F33] hover:text-[#E8A33D] transition-colors">Back to Dashboard</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
