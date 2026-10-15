import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Armchair, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { createBus } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';
import Toast from '../Toast';

const BUS_TYPES = [
  { value: 'AC_SLEEPER', label: 'AC Sleeper', category: 'sleeper', desc: 'Air-conditioned berths for overnight routes' },
  { value: 'NON_AC_SLEEPER', label: 'Non-AC Sleeper', category: 'sleeper', desc: 'Standard sleeper berths' },
  { value: 'AC_SEATER', label: 'AC Seater', category: 'seater', desc: '2x2 pushback seating with climate control' },
  { value: 'NON_AC_SEATER', label: 'Non-AC Seater', category: 'seater', desc: 'Standard commuter seating' },
];

const CreateBus = () => {
  const navigate = useNavigate();
  const [registrationNo, setRegistrationNo] = useState('');
  const [busType, setBusType] = useState('AC_SLEEPER');
  const [totalSeats, setTotalSeats] = useState(36);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const validate = () => {
    const next = {};
    if (!registrationNo.trim()) {
      next.registrationNo = 'Vehicle registration number is required (e.g. MH-12-AB-1234)';
    }
    const seats = Number(totalSeats);
    if (!totalSeats || seats < 1) {
      next.totalSeats = 'Seat count must be at least 1';
    } else if (seats > 60) {
      next.totalSeats = 'Seat count cannot exceed 60';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const reg = registrationNo.trim().toUpperCase();
      await createBus({
        registration_no: reg,
        bus_type: busType,
        total_seats: Number(totalSeats),
      });

      setToastMessage(`Bus ${reg} successfully registered.`);
      setTimeout(() => navigate('/operator/buses'), 1000);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to register bus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OperatorLayout
      title="Register Vehicle"
      subtitle="Add a new bus to your fleet operations"
      action={
        <Link
          to="/operator/buses"
          className="h-9 px-3.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Fleet List</span>
        </Link>
      }
    >
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      <div className="max-w-2xl bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Registration Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Registration Number
            </label>
            <input
              type="text"
              placeholder="e.g. MH-12-AB-9999"
              value={registrationNo}
              onChange={(e) => {
                setRegistrationNo(e.target.value.toUpperCase());
                if (fieldErrors.registrationNo) setFieldErrors((p) => ({ ...p, registrationNo: undefined }));
              }}
              className="w-full h-11 px-4 rounded-xl border border-zinc-200 font-mono font-bold text-sm text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all placeholder:text-zinc-400 placeholder:font-normal uppercase"
            />
            {fieldErrors.registrationNo && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.registrationNo}</p>
            )}
          </div>

          {/* Bus Type Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Vehicle Type & Layout
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUS_TYPES.map((type) => {
                const selected = busType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setBusType(type.value)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{type.label}</span>
                      {selected && <Check size={14} className="text-white" />}
                    </div>
                    <p className={`text-[11px] mt-1 leading-snug ${selected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                      {type.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total Seating Capacity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Seating Capacity (Seats)
            </label>
            <div className="relative">
              <Armchair size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="10"
                max="60"
                value={totalSeats}
                onChange={(e) => {
                  setTotalSeats(e.target.value);
                  if (fieldErrors.totalSeats) setFieldErrors((p) => ({ ...p, totalSeats: undefined }));
                }}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 font-bold text-sm text-zinc-900 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
              />
            </div>
            {fieldErrors.totalSeats && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.totalSeats}</p>
            )}
            <p className="text-[11px] text-zinc-400 mt-1.5">
              Physical seat layout records (<span className="font-mono font-semibold">seat_layouts</span>) will be automatically initialized for this bus.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <Link
              to="/operator/buses"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Registering Bus...' : 'Save & Initialize Layout'}
            </button>
          </div>
        </form>
      </div>
    </OperatorLayout>
  );
};

export default CreateBus;