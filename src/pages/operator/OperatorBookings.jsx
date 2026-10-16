import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Ticket, Search, CheckCircle2, XCircle, Clock,
  User, Phone, Mail, Bus, Armchair, Printer, Download,
  Filter, X, ArrowRight, MapPin, Users
} from 'lucide-react';
import { getOperatorBookings } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';
import BusOccupancyModal from '../../components/operator/BusOccupancyModal';

const OperatorBookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const scheduleFilterParam = searchParams.get('schedule') || '';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSchedule, setActiveSchedule] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
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
        scheduleId: b.schedule_id,
        origin: b.origin,
        destination: b.destination,
        passenger: b.passenger_name || 'Passenger',
        passengerDetails: b.passenger_details || '',
        boardingPoint: b.boarding_point || '',
        droppingPoint: b.dropping_point || '',
        email: b.passenger_email || '',
        phone: b.passenger_phone || '',
        route: (b.origin && b.destination) ? `${b.origin} → ${b.destination}` : 'Route',
        busNumber: b.bus_number || '—',
        seat: b.seat_number || '—',
        fare: Number(b.amount || 0),
        status: (b.status || 'confirmed').toLowerCase(),
        bookedAt: b.confirmed_at || b.created_at,
      })),
    [bookings]
  );

  const filtered = useMemo(() => {
    return normalized.filter((b) => {
      const matchesSchedule = !scheduleFilterParam || b.scheduleId === scheduleFilterParam;
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !query ||
        String(b.bookingRef).toLowerCase().includes(q) ||
        b.passenger.toLowerCase().includes(q) ||
        b.passengerDetails.toLowerCase().includes(q) ||
        b.boardingPoint.toLowerCase().includes(q) ||
        b.droppingPoint.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.seat.toLowerCase().includes(q) ||
        b.route.toLowerCase().includes(q);
      return matchesSchedule && matchesStatus && matchesQuery;
    });
  }, [normalized, scheduleFilterParam, statusFilter, query]);

  // Aggregate stats for current view
  const stats = useMemo(() => {
    const totalCount = filtered.length;
    const confirmedCount = filtered.filter((b) => b.status === 'confirmed').length;
    const cancelledCount = filtered.filter((b) => b.status === 'cancelled').length;
    const totalRevenue = filtered
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.fare, 0);

    return { totalCount, confirmedCount, cancelledCount, totalRevenue };
  }, [filtered]);

  // Export CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      'Booking Ref', 'Primary Passenger', 'Passenger Details', 'Boarding Point',
      'Dropping Point', 'Email', 'Phone', 'Route', 'Bus Number', 'Seats',
      'Amount', 'Status', 'Booking Date'
    ];
    const rows = filtered.map((b) => [
      `"${b.bookingRef}"`,
      `"${b.passenger}"`,
      `"${b.passengerDetails.replaceAll('"', '""')}"`,
      `"${b.boardingPoint.replaceAll('"', '""')}"`,
      `"${b.droppingPoint.replaceAll('"', '""')}"`,
      `"${b.email}"`,
      `"${b.phone}"`,
      `"${b.route}"`,
      `"${b.busNumber}"`,
      `"${b.seat}"`,
      b.fare,
      `"${b.status}"`,
      `"${b.bookedAt ? new Date(b.bookedAt).toLocaleString('en-IN') : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manifest_${scheduleFilterParam ? `schedule_${scheduleFilterParam.slice(0, 8)}` : 'all'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const clearScheduleFilter = () => {
    searchParams.delete('schedule');
    setSearchParams(searchParams);
  };

  const activeTripInfo = scheduleFilterParam && filtered[0]
    ? `${filtered[0].route} (${filtered[0].busNumber})`
    : null;

  return (
    <OperatorLayout
      title="Passenger Manifest"
      subtitle="Live passenger bookings, seat allocations, and verified contact info"
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-40 cursor-pointer"
            title="Export CSV for conductor/depot"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Print manifest list"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print Manifest</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Schedule Filter Banner */}
        {scheduleFilterParam && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <Bus size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-950">
                  Filtered by Trip Schedule: <span className="font-mono text-indigo-700">{scheduleFilterParam.slice(0, 8)}...</span>
                </p>
                {activeTripInfo && (
                  <p className="text-[11px] text-indigo-600 font-medium">{activeTripInfo}</p>
                )}
              </div>
            </div>

            <button
              onClick={clearScheduleFilter}
              type="button"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <X size={14} />
              <span>Clear Filter (View All Trips)</span>
            </button>
          </div>
        )}

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              Total Records
            </span>
            <p className="text-2xl font-bold tracking-tight text-zinc-900">{stats.totalCount}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Booking orders listed</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
              Confirmed Manifests
            </span>
            <p className="text-2xl font-bold tracking-tight text-emerald-700">{stats.confirmedCount}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Valid boarded / travelling</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 block mb-1">
              Cancelled Bookings
            </span>
            <p className="text-2xl font-bold tracking-tight text-rose-600">{stats.cancelledCount}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Seats released to inventory</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              Manifest Revenue
            </span>
            <p className="text-2xl font-bold tracking-tight text-zinc-900">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Realized net value</p>
          </div>
        </div>

        {/* Controls: Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by passenger, ref, seat, stop, route..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              All ({normalized.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'confirmed' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Confirmed ({normalized.filter((b) => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'cancelled' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Cancelled ({normalized.filter((b) => b.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Minimalist Manifest Table */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-xs print:border-none print:shadow-none">
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
                    <th className="py-3.5 px-4">Passenger Manifest</th>
                    <th className="py-3.5 px-4">Boarding & Dropping</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Route & Bus</th>
                    <th className="py-3.5 px-4">Seats</th>
                    <th className="py-3.5 px-4">Fare</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right print:hidden">Cabin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                  {filtered.map((b) => {
                    const isConfirmed = b.status === 'confirmed';
                    return (
                      <tr key={b.bookingRef} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-zinc-900 align-top">
                          #{b.bookingRef}
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-zinc-900">{b.passenger}</div>
                          {b.passengerDetails && (
                            <div className="text-[11px] text-zinc-500 mt-1 space-y-0.5">
                              {b.passengerDetails.split('; ').map((detail, i) => (
                                <div key={i} className="inline-block bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 mr-1 mb-1 font-medium">
                                  {detail}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 align-top text-zinc-600">
                          {b.boardingPoint && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              <span className="truncate max-w-[140px]" title={b.boardingPoint}>
                                {b.boardingPoint}
                              </span>
                            </div>
                          )}
                          {b.droppingPoint && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate max-w-[140px]" title={b.droppingPoint}>
                                {b.droppingPoint}
                              </span>
                            </div>
                          )}
                          {!b.boardingPoint && !b.droppingPoint && <span className="text-zinc-400">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 align-top">
                          <div>{b.email || '—'}</div>
                          <div className="text-[11px] text-zinc-400">{b.phone || ''}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-800 align-top">
                          <div>{b.route}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{b.busNumber}</div>
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {b.seat}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900 align-top">
                          ₹{Number(b.fare).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="capitalize">{b.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right print:hidden align-top">
                          {b.scheduleId ? (
                            <button
                              type="button"
                              onClick={() => setActiveSchedule({
                                id: b.scheduleId,
                                origin: b.origin,
                                destination: b.destination,
                                bus_number: b.busNumber,
                                base_fare: b.fare,
                              })}
                              className="h-7 px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Inspect cabin seat map"
                            >
                              <Armchair size={12} />
                              <span>View Map</span>
                            </button>
                          ) : (
                            <span className="text-zinc-300 text-[11px]">—</span>
                          )}
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

      {/* Live Bus Occupancy Modal */}
      <BusOccupancyModal
        isOpen={Boolean(activeSchedule)}
        onClose={() => setActiveSchedule(null)}
        schedule={activeSchedule}
      />
    </OperatorLayout>
  );
};

export default OperatorBookings;