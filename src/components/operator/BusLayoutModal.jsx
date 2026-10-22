import React, { useEffect, useState, useMemo } from 'react';
import { X, Bus, Disc, Armchair, RotateCw, CheckCircle2 } from 'lucide-react';
import { getBusLayout } from '../../api/operator';

const BusLayoutModal = ({ isOpen, onClose, bus }) => {
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);

  const busId = bus?.id;

  const loadLayout = async () => {
    if (!busId) return;
    setSelectedSeat(null);
    setLoading(true);
    setError('');
    try {
      const res = await getBusLayout(busId);
      setLayout(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vehicle seat layout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !busId) return;
    let ignore = false;
    getBusLayout(busId)
      .then((res) => {
        if (!ignore) {
          setLayout(res.data?.data || []);
          setSelectedSeat(null);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.response?.data?.message || 'Failed to fetch vehicle seat layout');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [isOpen, busId]);

  const sortedSeats = useMemo(() => {
    return [...layout].sort((a, b) => {
      if (a.row_num !== b.row_num) return a.row_num - b.row_num;
      return a.col_num - b.col_num;
    });
  }, [layout]);

  if (!isOpen || !bus) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Bus size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 font-mono tracking-tight">
                  {bus.registration_no}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                  {bus.bus_type?.replaceAll('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Physical Seating Configuration ({bus.total_seats} Total Seats)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadLayout}
              disabled={loading}
              title="Refresh seat layout"
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

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="flex items-center justify-between text-xs text-zinc-600 bg-zinc-50 p-3 rounded-2xl border border-zinc-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Layout Type</span>
              <span className="font-bold text-zinc-900">2x2 Standard Corridor Layout</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Total Physical Seats</span>
              <span className="font-bold text-zinc-900 font-mono">{sortedSeats.length} Berths/Seats</span>
            </div>
          </div>

          {/* Cabin Layout */}
          <div className="bg-zinc-50 border-2 border-zinc-200/90 rounded-[2rem] p-6 max-w-sm mx-auto shadow-inner">
            {/* Driver Cockpit Bar */}
            <div className="pb-4 mb-5 border-b-2 border-dashed border-zinc-200 flex items-center justify-between text-xs font-semibold text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-700 uppercase tracking-wider font-bold text-[11px]">Front Cab</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-xs">
                <Disc size={15} className="text-zinc-500" />
                <span className="text-[11px] font-medium">Driver Cockpit</span>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Loading seat arrangement...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-xs text-red-600 font-semibold">{error}</div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto">
                {sortedSeats.map((seat, index) => {
                  const isAisleEdge = (index % 4 === 1);
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
                          relative group w-12 h-13 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all select-none cursor-pointer
                          ${isSelected ? 'ring-2 ring-zinc-900 ring-offset-2 bg-zinc-900 text-white' : 'bg-white border border-zinc-300 text-zinc-700 hover:border-zinc-500'}
                        `}
                      >
                        <div className="text-[9px] font-mono font-bold">
                          {seat.seat_number}
                        </div>

                        <Armchair
                          size={18}
                          className={isSelected ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-900'}
                        />

                        <div className="text-[8px] font-bold uppercase tracking-tight">
                          {seat.is_window ? 'Window' : 'Aisle'}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seat details */}
          {selectedSeat && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                  <Armchair size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">
                    Seat {selectedSeat.seat_number} ({selectedSeat.is_window ? 'Window' : 'Aisle'})
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Row {selectedSeat.row_num}, Column {selectedSeat.col_num} • {selectedSeat.seat_type || 'Standard'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Configured
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-end">
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

export default BusLayoutModal;
