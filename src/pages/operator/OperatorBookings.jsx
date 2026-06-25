import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Ticket,
  Search,
  AlertCircle,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { getOperatorBookings } from '../../api/operator';

const STATUS_FILTERS = ['all', 'confirmed', 'cancelled', 'pending'];

const statusStyles = {
  confirmed: { badge: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  cancelled: { badge: 'bg-red-50 text-red-700', icon: XCircle, iconColor: 'text-red-500' },
  pending: { badge: 'bg-amber-50 text-amber-700', icon: Clock, iconColor: 'text-amber-500' },
};

const SkeletonRow = () => (
  <tr className="border-b border-stone-100">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3.5 bg-stone-100 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
      </td>
    ))}
  </tr>
);

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
        console.log('OPERATOR BOOKINGS:', res.data);
        setBookings(res.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to load operator bookings'
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const normalized = useMemo(
    () =>
      bookings.map((b) => ({
        bookingRef: b.booking_ref || b.booking_id || b.id,
        passenger: b.passenger_name || b.user_name || b.email || 'Passenger',
        seat: b.seat || b.seat_number || '-',
        fare: b.fare || b.amount || b.total_fare || 0,
        status: (b.status || 'confirmed').toLowerCase(),
        bookedAt: b.booked_at || b.created_at,
      })),
    [bookings]
  );

  const filtered = useMemo(() => {
    return normalized.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesQuery =
        !query ||
        String(b.bookingRef).toLowerCase().includes(query.toLowerCase()) ||
        b.passenger.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [normalized, query, statusFilter]);

  const summary = useMemo(() => {
    const confirmed = normalized.filter((b) => b.status === 'confirmed').length;
    const cancelled = normalized.filter((b) => b.status === 'cancelled').length;
    const revenue = normalized
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.fare || 0), 0);
    return { total: normalized.length, confirmed, cancelled, revenue };
  }, [normalized]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-stone-200 h-16 flex items-center px-6 lg:px-8">
        <Link
          to="/operator/dashboard"
          className="flex items-center gap-2 text-[13.5px] font-medium text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Operator dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[#101F33] flex items-center justify-center">
            <Ticket size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Bookings</h1>
        </div>
        <p className="text-stone-500 text-[15px] ml-12">
          All passenger bookings across your fleet.
        </p>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-7">
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-[12.5px] font-medium text-stone-500">Total bookings</p>
            <p className="text-[22px] font-semibold text-stone-900 font-mono mt-1">{summary.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-[12.5px] font-medium text-stone-500">Confirmed</p>
            <p className="text-[22px] font-semibold text-emerald-600 font-mono mt-1">{summary.confirmed}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-[12.5px] font-medium text-stone-500">Cancelled</p>
            <p className="text-[22px] font-semibold text-red-500 font-mono mt-1">{summary.cancelled}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-[12.5px] font-medium text-stone-500">Revenue</p>
            <p className="text-[22px] font-semibold text-stone-900 font-mono mt-1">
              ₹{summary.revenue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
            <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-[14px] text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-7 bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-stone-100">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by booking ref or passenger name"
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-stone-200 text-[14px] outline-none focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5 transition-colors"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-10 px-3.5 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-colors
                    ${statusFilter === s
                      ? 'bg-[#101F33] text-white'
                      : 'bg-slate-50 text-stone-500 hover:text-stone-800'
                    }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="px-4 py-3 text-[12.5px] font-medium text-stone-500 uppercase tracking-wide">Booking ref</th>
                  <th className="px-4 py-3 text-[12.5px] font-medium text-stone-500 uppercase tracking-wide">Passenger</th>
                  <th className="px-4 py-3 text-[12.5px] font-medium text-stone-500 uppercase tracking-wide">Seat</th>
                  <th className="px-4 py-3 text-[12.5px] font-medium text-stone-500 uppercase tracking-wide">Booked at</th>
                  <th className="px-4 py-3 text-[12.5px] font-medium text-stone-500 uppercase tracking-wide">Fare</th>
                  <th className="px-4 py-3 text-[12.5px] font-medium text-stone-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-stone-500 text-[14px]">
                        {normalized.length === 0
                          ? 'No bookings yet.'
                          : 'No bookings match your search.'}
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((b) => {
                    const style = statusStyles[b.status] || statusStyles.pending;
                    const StatusIcon = style.icon;
                    return (
                      <tr
                        key={b.bookingRef}
                        className="border-b border-stone-100 hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-4 py-3.5 text-[14px] font-mono text-stone-700">
                          {b.bookingRef}
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-stone-900">{b.passenger}</td>
                        <td className="px-4 py-3.5 text-[14px] text-stone-600">{b.seat}</td>
                        <td className="px-4 py-3.5 text-[13.5px] text-stone-500">
                          {b.bookedAt ? new Date(b.bookedAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-[14px] font-medium text-stone-900">
                          <span className="inline-flex items-center gap-0.5">
                            <IndianRupee size={12} />
                            {Number(b.fare).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12.5px] font-medium ${style.badge}`}>
                            <StatusIcon size={12} className={style.iconColor} />
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-stone-100 text-[13px] text-stone-400">
              Showing {filtered.length} of {normalized.length} bookings
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OperatorBookings;