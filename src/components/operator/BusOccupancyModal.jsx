import React, { useEffect, useState, useMemo } from 'react';
import {
  X, Bus, Disc, Lock, CheckCircle2, RotateCw,
  Users, Percent, ShieldCheck, Armchair, AlertCircle
} from 'lucide-react';
import { getSeats } from '../../api/seats';

const BusOccupancyModal = ({ isOpen, onClose, schedule }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'booked', 'locked', 'available'
  const [selectedSeat, setSelectedSeat] = useState(null);

  const scheduleId = schedule?.id;

  const loadSeats = async () => {
    if (!scheduleId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getSeats(scheduleId);
      setSeats(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch live seat map');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && scheduleId) {
      setSelectedSeat(null);
      loadSeats();
    }
  }, [isOpen, scheduleId]);

  // Sort seats logically
  const sortedSeats = useMemo(() => {
    return [...seats].sort((a, b) => {
      const seatA = a.seat_number || '';
      const seatB = b.seat_number || '';
      const numA = parseInt(seatA.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(seatB.replace(/\D/g, ''), 10) || 0;
      const charA = seatA.replace(/[0-9]/g, '');
      const charB = seatB.replace(/[0-9]/g, '');

      if (numA !== numB) return numA - numB;
      return charA.localeCompare(charB);
    });
  }, [seats]);

  const stats = useMemo(() => {
    const total = sortedSeats.length;
    const booked = sortedSeats.filter((s) => s.status?.toLowerCase() === 'booked').length;
    const locked = sortedSeats.filter((s) => s.status?.toLowerCase() === 'locked').length;
    const available = sortedSeats.filter((s) => s.status?.toLowerCase() === 'available' || (!s.status)).length;
    const occupancyRate = total > 0 ? Math.round((booked / total) * 100) : 0;

    return { total, booked, locked, available, occupancyRate };
  }, [sortedSeats]);

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Bus size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900">
                  {schedule.origin} → {schedule.destination}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                  {schedule.bus_number}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Live Seat Inventory & Cabin Occupancy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSeats}
              disabled={loading}
              title="Refresh live seats"
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Total Capacity</span>
              <p className="text-xl font-black text-zinc-900 mt-0.5">{stats.total} Seats</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Booked / Occupied</span>
              <p className="text-xl font-black text-indigo-950 mt-0.5">
                {stats.booked} <span className="text-xs font-semibold text-indigo-600">({stats.occupancyRate}%)</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">In Checkout Lock</span>
              <p className="text-xl font-black text-amber-950 mt-0.5">{stats.locked} Seats</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Available</span>
              <p className="text-xl font-black text-emerald-950 mt-0.5">{stats.available} Seats</p>
            </div>
          </div>

          {/* Occupancy Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-zinc-600 mb-1.5">
              <span>Bus Capacity Fill Rate</span>
              <span>{stats.occupancyRate}% Occupied</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${stats.occupancyRate}%` }}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.locked / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Legend and Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-medium text-zinc-600">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-white border-2 border-zinc-300" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-zinc-900 border-2 border-zinc-900 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 text-[9px] font-bold">
                  •
                </div>
                <span>Locked</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-[11px] font-bold">
              {['all', 'booked', 'locked', 'available'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    filter === tab
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Bus Cabin Layout */}
          <div className="bg-zinc-50 border-2 border-zinc-200/90 rounded-[2rem] p-6 max-w-md mx-auto relative shadow-inner">
            
            {/* Front Windshield & Driver Cab */}
            <div className="pb-4 mb-5 border-b-2 border-dashed border-zinc-200 flex items-center justify-between text-xs font-semibold text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-700 uppercase tracking-wider font-bold text-[11px]">Front Cabin</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-xs">
                <Disc size={15} className="text-zinc-500" />
                <span className="text-[11px] font-medium">Driver Cockpit</span>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Refreshing seat layout...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-xs text-red-600 font-semibold">{error}</div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-xs mx-auto">
                {sortedSeats.map((seat, index) => {
                  const status = (seat.status || 'available').toLowerCase();
                  const isBooked = status === 'booked';
                  const isLocked = status === 'locked';
                  const isAvailable = !isBooked && !isLocked;

                  const isAisleEdge = (index % 4 === 1);
                  const isFilteredOut = filter !== 'all' && filter !== status;
                  const isSelected = selectedSeat?.seat_number === seat.seat_number;

                  return (
                    <div
                      key={seat.seat_number}
                      className={`flex justify-center ${isAisleEdge ? 'mr-3 sm:mr-4' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSeat(seat)}
                        className={`
                          relative group w-12 h-13 sm:w-13 sm:h-14 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all select-none cursor-pointer
                          ${isFilteredOut ? 'opacity-20' : 'opacity-100'}
                          ${isSelected ? 'ring-2 ring-zinc-900 ring-offset-2' : ''}
                          ${
                            isBooked
                              ? 'bg-zinc-900 border border-zinc-900 text-white shadow-xs'
                              : isLocked
                              ? 'bg-amber-100 border border-amber-300 text-amber-900'
                              : 'bg-white border border-zinc-300 text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50/30'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between w-full text-[9px] font-mono font-bold">
                          <span>{seat.seat_number}</span>
                          {isBooked ? (
                            <span className="text-[8px] opacity-80">RES</span>
                          ) : isLocked ? (
                            <Lock size={10} className="text-amber-700" />
                          ) : null}
                        </div>

                        <Armchair
                          size={18}
                          className={`
                            transition-transform group-hover:scale-110
                            ${isBooked ? 'text-white' : isLocked ? 'text-amber-700' : 'text-zinc-400'}
                          `}
                        />

                        <div className="text-[8px] font-bold uppercase tracking-tight">
                          {isBooked ? 'Booked' : isLocked ? 'Locked' : 'Open'}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seat Details Drawer / Inspector Card */}
          {selectedSeat && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                  selectedSeat.status?.toLowerCase() === 'booked'
                    ? 'bg-zinc-900'
                    : selectedSeat.status?.toLowerCase() === 'locked'
                    ? 'bg-amber-600'
                    : 'bg-emerald-600'
                }`}>
                  <Armchair size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">
                    Seat {selectedSeat.seat_number} • <span className="capitalize">{selectedSeat.status || 'Available'}</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {selectedSeat.seat_type || 'Standard'} • {selectedSeat.deck_type || 'Lower Deck'} {selectedSeat.is_window ? '• Window Seat' : ''}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Fare</span>
                <span className="text-sm font-black text-zinc-900">₹{schedule.base_fare}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Real-time synchronised with atomic lock manager</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};

export default BusOccupancyModal;
