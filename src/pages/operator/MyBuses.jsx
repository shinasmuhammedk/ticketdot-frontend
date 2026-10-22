import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus, Plus, Armchair, Search, Pencil, Trash2,
  Check, X, AlertTriangle, ShieldAlert, Sparkles, Filter,
  CalendarDays
} from 'lucide-react';

import { getBuses, updateBus, deleteBus } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';
import BusLayoutModal from '../../components/operator/BusLayoutModal';
import Toast from '../Toast';

const BUS_TYPES = [
  { value: 'AC_SLEEPER', label: 'AC Sleeper' },
  { value: 'NON_AC_SLEEPER', label: 'Non-AC Sleeper' },
  { value: 'AC_SEATER', label: 'AC Seater' },
  { value: 'NON_AC_SEATER', label: 'Non-AC Seater' },
];

const MyBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [inspectBus, setInspectBus] = useState(null);
  const [editingBus, setEditingBus] = useState(null);
  const [deletingBus, setDeletingBus] = useState(null);

  // Edit form state
  const [editRegNo, setEditRegNo] = useState('');
  const [editBusType, setEditBusType] = useState('AC_SLEEPER');
  const [editTotalSeats, setEditTotalSeats] = useState(36);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadBuses = async () => {
    try {
      const res = await getBuses();
      setBuses(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load fleet buses'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getBuses()
      .then((res) => {
        if (!ignore) setBuses(res.data?.data || []);
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to load fleet buses'
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered buses
  const filteredBuses = useMemo(() => {
    return buses.filter((b) => {
      const matchesSearch = !searchQuery || b.registration_no?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesType = typeFilter === 'ALL' || b.bus_type?.toUpperCase() === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [buses, searchQuery, typeFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalBuses = buses.length;
    const totalCapacity = buses.reduce((acc, b) => acc + (b.total_seats || 0), 0);
    const sleepers = buses.filter((b) => b.bus_type?.includes('SLEEPER')).length;
    const seaters = buses.filter((b) => b.bus_type?.includes('SEATER')).length;
    return { totalBuses, totalCapacity, sleepers, seaters };
  }, [buses]);

  // Open Edit Modal
  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setEditRegNo(bus.registration_no || '');
    setEditBusType(bus.bus_type || 'AC_SLEEPER');
    setEditTotalSeats(bus.total_seats || 36);
    setEditError('');
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editRegNo.trim()) {
      setEditError('Registration number is required');
      return;
    }
    const seats = Number(editTotalSeats);
    if (!seats || seats < 1 || seats > 60) {
      setEditError('Seat count must be between 1 and 60');
      return;
    }

    setEditLoading(true);
    setEditError('');
    try {
      await updateBus(editingBus.id, {
        registration_no: editRegNo.trim().toUpperCase(),
        bus_type: editBusType,
        total_seats: seats,
      });

      setToastMessage(`Vehicle ${editRegNo.trim().toUpperCase()} updated successfully.`);
      setEditingBus(null);
      loadBuses();
    } catch (err) {
      setEditError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update vehicle details'
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingBus) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteBus(deletingBus.id);
      setToastMessage(`Vehicle ${deletingBus.registration_no} removed from fleet.`);
      setDeletingBus(null);
      loadBuses();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to delete vehicle'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <OperatorLayout
      title="Fleet Vehicles"
      subtitle="Manage registered buses, layout configurations, and fleet capacity"
      action={
        <Link
          to="/operator/create-bus"
          className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>Register Vehicle</span>
        </Link>
      }
    >
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      <div className="space-y-5">
        {/* Fleet KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Total Vehicles</span>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{stats.totalBuses}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Active in fleet</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Fleet Capacity</span>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{stats.totalCapacity}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Total passenger berths</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Sleeper Coaches</span>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{stats.sleepers}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Overnight configuration</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Seater Coaches</span>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{stats.seaters}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Pushback commuter buses</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by vehicle reg number (e.g. MH-12)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-mono"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'AC_SLEEPER', 'NON_AC_SLEEPER', 'AC_SEATER', 'NON_AC_SEATER'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  typeFilter === t
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {t === 'ALL' ? 'All Vehicles' : t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Main List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-medium">Loading fleet data...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-xs">
            <Bus size={36} className="mx-auto text-zinc-300 mb-3" />
            <h3 className="text-sm font-bold text-zinc-900">
              {searchQuery || typeFilter !== 'ALL' ? 'No Matching Vehicles Found' : 'No Fleet Buses Yet'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              {searchQuery || typeFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter tags.'
                : 'Add a bus to your fleet to configure seating arrangements and create schedules.'}
            </p>
            {searchQuery || typeFilter !== 'ALL' ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); }}
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/operator/create-bus"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
              >
                <Plus size={14} />
                Register Vehicle
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuses.map((bus) => (
              <div
                key={bus.id}
                className="bg-white rounded-3xl border border-zinc-200/80 p-5 hover:border-zinc-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center shadow-2xs">
                        <Bus size={19} />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-base text-zinc-900 tracking-tight">
                          {bus.registration_no}
                        </h3>
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                          {bus.bus_type?.replaceAll('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 flex items-center gap-1">
                      <Armchair size={13} className="text-zinc-500" />
                      {bus.total_seats} Seats
                    </span>
                  </div>

                  <div className="py-2.5 px-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-4">
                    <span>ID: {bus.id.slice(0, 8)}...</span>
                    <span className="text-emerald-600 font-medium">Ready for dispatch</span>
                  </div>
                </div>

                {/* Bus Card Actions */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/operator/create-schedule?busId=${bus.id}`}
                      className="h-8 px-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                      title="Create schedule for this bus"
                    >
                      <CalendarDays size={12} />
                      <span>Schedule</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setInspectBus(bus)}
                      className="h-8 px-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="View physical cabin layout"
                    >
                      <Armchair size={12} />
                      <span>Layout</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(bus)}
                      className="w-8 h-8 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit vehicle details"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => { setDeletingBus(bus); setDeleteError(''); }}
                      className="w-8 h-8 rounded-xl border border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete vehicle"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspect Bus Layout Modal */}
      <BusLayoutModal
        isOpen={Boolean(inspectBus)}
        onClose={() => setInspectBus(null)}
        bus={inspectBus}
      />

      {/* Edit Bus Modal */}
      {editingBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              <div className="flex items-center gap-2">
                <Pencil size={16} className="text-zinc-700" />
                <h3 className="text-sm font-bold text-zinc-900">Edit Vehicle</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBus(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-red-500" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={editRegNo}
                  onChange={(e) => setEditRegNo(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 font-mono font-bold text-sm text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Vehicle Type
                </label>
                <select
                  value={editBusType}
                  onChange={(e) => setEditBusType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none cursor-pointer"
                >
                  {BUS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Seating Capacity (Seats)
                </label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={editTotalSeats}
                  onChange={(e) => setEditTotalSeats(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 font-bold text-sm text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 outline-none"
                  required
                />
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                  Note: Updating seat capacity will re-initialize physical layouts. This is only permitted if the bus has no existing trip schedules.
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBus(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Bus Confirmation Modal */}
      {deletingBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-zinc-900">Delete Vehicle</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Are you sure you want to remove vehicle <span className="font-mono font-bold text-zinc-800">{deletingBus.registration_no}</span> from your fleet?
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {deleteError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingBus(null)}
                className="w-1/2 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="w-1/2 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Bus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OperatorLayout>
  );
};

export default MyBuses;