import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bus,
  CheckCircle2,
  AlertCircle,
  X,
  Armchair,
} from 'lucide-react';
import { createBus } from '../../api/operator';

const busTypes = [
  { value: 'AC_SLEEPER', label: 'AC sleeper', rows: 'sleeper' },
  { value: 'NON_AC_SLEEPER', label: 'Non-AC sleeper', rows: 'sleeper' },
  { value: 'AC_SEATER', label: 'AC seater', rows: 'seater' },
  { value: 'NON_AC_SEATER', label: 'Non-AC seater', rows: 'seater' },
];

const REG_NO_PATTERN = /^[A-Z]{2}-\d{1,2}-[A-Z]{1,2}-\d{4}$/;

const CreateBus = () => {
  const [registrationNo, setRegistrationNo] = useState('');
  const [busType, setBusType] = useState('AC_SLEEPER');
  const [totalSeats, setTotalSeats] = useState(40);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const selectedType = busTypes.find((t) => t.value === busType);

  const validate = () => {
    const next = {};
    if (!registrationNo.trim()) {
      next.registrationNo = 'Registration number is required';
    } else if (!REG_NO_PATTERN.test(registrationNo.trim().toUpperCase())) {
      next.registrationNo = 'Use the format KL-10-AV-6577';
    }
    const seats = Number(totalSeats);
    if (!totalSeats || seats < 1) {
      next.totalSeats = 'Enter a seat count of at least 1';
    } else if (seats > 60) {
      next.totalSeats = 'Seat count looks too high, double check';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setFieldErrors(validationErrors);
    setMessage('');
    setError('');
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await createBus({
        registration_no: registrationNo.trim().toUpperCase(),
        bus_type: busType,
        total_seats: Number(totalSeats),
      });

      setMessage(`Bus ${registrationNo.trim().toUpperCase()} added to your fleet`);
      setRegistrationNo('');
      setBusType('AC_SLEEPER');
      setTotalSeats(40);
      setFieldErrors({});
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to create bus'
      );
    } finally {
      setLoading(false);
    }
  };

  // Simple visual seat-layout preview, 2+2 seater or 2+1 sleeper berths
  const seatPreview = useMemo(() => {
    const seats = Math.max(0, Math.min(60, Number(totalSeats) || 0));
    const isSleeper = selectedType?.rows === 'sleeper';
    const perRow = isSleeper ? 3 : 4;
    const rowCount = Math.ceil(seats / perRow);
    const rows = [];
    let remaining = seats;
    for (let r = 0; r < rowCount; r++) {
      const inRow = Math.min(perRow, remaining);
      rows.push(inRow);
      remaining -= inRow;
    }
    return { rows, isSleeper };
  }, [totalSeats, selectedType]);

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

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[#101F33] flex items-center justify-center">
            <Bus size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Add a bus</h1>
        </div>
        <p className="text-stone-500 text-[15px] ml-12">
          Register a new vehicle and define its seating layout.
        </p>

        {message && (
          <div className="mt-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5">
            <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[14px] text-emerald-800 flex-1">{message}</p>
            <button onClick={() => setMessage('')} aria-label="Dismiss">
              <X size={16} className="text-emerald-600" />
            </button>
          </div>
        )}
        {error && (
          <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
            <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-[14px] text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')} aria-label="Dismiss">
              <X size={16} className="text-red-600" />
            </button>
          </div>
        )}

        <div className="mt-7 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="reg" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Registration number
                </label>
                <input
                  id="reg"
                  type="text"
                  placeholder="KL-10-AV-6577"
                  value={registrationNo}
                  onChange={(e) => {
                    setRegistrationNo(e.target.value);
                    if (fieldErrors.registrationNo)
                      setFieldErrors((p) => ({ ...p, registrationNo: undefined }));
                  }}
                  aria-invalid={Boolean(fieldErrors.registrationNo)}
                  className={`w-full h-12 px-4 rounded-xl border bg-white text-[15px] uppercase placeholder:normal-case placeholder:text-stone-400 outline-none transition-colors font-mono tracking-wide
                    ${fieldErrors.registrationNo
                      ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                      : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                    }`}
                />
                {fieldErrors.registrationNo ? (
                  <p className="mt-1.5 text-sm text-red-500">{fieldErrors.registrationNo}</p>
                ) : (
                  <p className="mt-1.5 text-[13px] text-stone-400">Format: state-RTO-series-number</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Bus type</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {busTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setBusType(type.value)}
                      className={`h-11 rounded-xl border text-[13.5px] font-medium transition-colors
                        ${busType === type.value
                          ? 'border-[#101F33] bg-[#101F33] text-white'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="seats" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Total seats
                </label>
                <input
                  id="seats"
                  type="number"
                  min="1"
                  max="60"
                  placeholder="40"
                  value={totalSeats}
                  onChange={(e) => {
                    setTotalSeats(e.target.value);
                    if (fieldErrors.totalSeats)
                      setFieldErrors((p) => ({ ...p, totalSeats: undefined }));
                  }}
                  aria-invalid={Boolean(fieldErrors.totalSeats)}
                  className={`w-full h-12 px-4 rounded-xl border bg-white text-[15px] outline-none transition-colors
                    ${fieldErrors.totalSeats
                      ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                      : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                    }`}
                />
                {fieldErrors.totalSeats && (
                  <p className="mt-1.5 text-sm text-red-500">{fieldErrors.totalSeats}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#101F33] text-white font-medium transition-all hover:bg-[#1A2D47] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Add bus to fleet'
                )}
              </button>
            </form>
          </div>

          {/* Live seat preview */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 h-fit">
            <div className="flex items-center gap-2 mb-1">
              <Armchair size={15} className="text-stone-400" />
              <span className="text-[13px] font-medium text-stone-500">Layout preview</span>
            </div>
            <p className="text-[22px] font-semibold text-stone-900 font-mono mb-4">
              {Math.max(0, Math.min(60, Number(totalSeats) || 0))}
              <span className="text-[13px] font-normal text-stone-400 font-sans ml-1.5">
                seats
              </span>
            </p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
              {seatPreview.rows.length === 0 && (
                <p className="text-[13px] text-stone-400 text-center py-6">
                  Enter a seat count to preview the layout
                </p>
              )}
              {seatPreview.rows.map((inRow, i) => (
                <div key={i} className="flex items-center justify-center gap-1.5">
                  {Array.from({ length: inRow }).map((_, j) => {
                    const aisleAfter = seatPreview.isSleeper ? 1 : 1;
                    return (
                      <React.Fragment key={j}>
                        <div
                          className={`w-5 ${seatPreview.isSleeper ? 'h-3.5' : 'h-5'} rounded-[3px] bg-[#101F33]/15`}
                        />
                        {j === aisleAfter - 1 && <div className="w-2.5" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-stone-400 leading-relaxed">
              Approximate layout based on bus type. Exact seat map is configured after creation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBus;