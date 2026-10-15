import React, { useEffect, useState, useMemo } from 'react';
import {
  Ticket, Search, CheckCircle2, XCircle, Clock,
  User, Phone, Mail, Bus, Armchair
} from 'lucide-react';
import { getOperatorBookings } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';

const OperatorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await getOperatorBookings();
        setBookings(res.data?.data || []);
      } catch (err) {
        setError('Failed to load passenger manifest');
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  const normalized = useMemo(
    () =>
      bookings.map((b) => ({
        bookingRef: b.booking_ref || b.id,
        passenger: b.passenger_name || 'Passenger',
        email: b.passenger_email || '',
        phone: b.passenger_phone || '',
        route: (b.origin && b.destination) ? `${b.origin} → ${b.destination}` : 'Route',
        busNumber: b.bus_number || '—',
        seat: b.seat_number || '—',
        fare: b.amount || 0,
        status: (b.status || 'confirmed').toLowerCase(),
        bookedAt: b.confirmed_at || b.created_at,
      })),
    [bookings]
  );

  const filtered = useMemo(() => {
    return normalized.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        String(b.bookingRef).toLowerCase().includes(q) ||
        b.passenger.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.seat.toLowerCase().includes(q) ||
        b.route.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [normalized, query, statusFilter]);

  const confirmedCount = normalized.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = normalized.filter((b) => b.status === 'cancelled').length;

  return (
    <OperatorLayout
      title="Passenger Manifest"
      subtitle="Live passenger bookings, seat allocations, and verified contact info"
    >
      <div className="space-y-4">
        {/* Controls: Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by passenger, ref, seat, route..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'all' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              All ({normalized.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'confirmed' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Confirmed ({confirmedCount})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'cancelled' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>
        </div>

        {/* Minimalist Manifest Table */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-zinc-500 font-medium">Loading passenger records...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-xs text-red-600 font-medium">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs">
              No matching bookings found in the manifest.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                    <th className="py-3.5 px-5">Ref #</th>
                    <th className="py-3.5 px-4">Passenger</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Route & Vehicle</th>
                    <th className="py-3.5 px-4">Seats</th>
                    <th className="py-3.5 px-4">Fare</th>
                    <th className="py-3.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                  {filtered.map((b) => {
                    const isConfirmed = b.status === 'confirmed';
                    return (
                      <tr key={b.bookingRef} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-zinc-900">
                          #{b.bookingRef}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">
                          {b.passenger}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500">
                          <div>{b.email || '—'}</div>
                          <div className="text-[11px] text-zinc-400">{b.phone || ''}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-800">
                          <div>{b.route}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{b.busNumber}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {b.seat}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">
                          ₹{Number(b.fare).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="capitalize">{b.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </OperatorLayout>
  );
};

export default OperatorBookings;