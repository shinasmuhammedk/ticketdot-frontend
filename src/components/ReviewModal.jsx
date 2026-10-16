import React, { useState } from 'react';
import { Star, X, CheckCircle2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { submitReview } from '../api/reviews';

const StarPicker = ({ label, value, onChange, icon = '★' }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = (hovered || value) >= star;
          return (
            <button
              type="button"
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              className="p-1 text-slate-300 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
            >
              <Star
                size={18}
                className={filled ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
              />
            </button>
          );
        })}
        <span className="w-5 text-right text-xs font-bold font-mono text-slate-700 ml-1">
          {value || '-'}
        </span>
      </div>
    </div>
  );
};

const ReviewModal = ({
  isOpen,
  onClose,
  bookingRef,
  origin,
  destination,
  operatorName,
  onSuccess,
}) => {
  const [cleanliness, setCleanliness] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [staff, setStaff] = useState(5);
  const [headline, setHeadline] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const averageRating = (
    (cleanliness + punctuality + comfort + staff) / 4.0
  ).toFixed(1);

  const getRatingTag = (avg) => {
    if (avg >= 4.5) return { text: 'Excellent Experience', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (avg >= 3.5) return { text: 'Good Journey', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (avg >= 2.5) return { text: 'Average Experience', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { text: 'Needs Improvement', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const tag = getRatingTag(Number(averageRating));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a few words about your travel experience');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await submitReview({
        booking_ref: bookingRef,
        cleanliness_rating: cleanliness,
        punctuality_rating: punctuality,
        comfort_rating: comfort,
        staff_rating: staff,
        headline: headline.trim() || undefined,
        comment: comment.trim(),
      });

      if (onSuccess) {
        onSuccess(res.data?.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              <span>Verified Traveler Review</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Rate Your Journey
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {origin} ➔ {destination} • {operatorName || 'TicketDot Express'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">

          {/* Average Rating Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Overall Score</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900">{averageRating}</span>
                <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tag.color}`}>
              {tag.text}
            </span>
          </div>

          {/* Sub-Category Sliders */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs space-y-0.5">
            <StarPicker label="Bus Cleanliness & Hygiene" value={cleanliness} onChange={setCleanliness} />
            <StarPicker label="Punctuality & Timing" value={punctuality} onChange={setPunctuality} />
            <StarPicker label="Seat Comfort & Air Conditioning" value={comfort} onChange={setComfort} />
            <StarPicker label="Staff & Driver Behavior" value={staff} onChange={setStaff} />
          </div>

          {/* Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Title
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Smooth, on-time night journey with clean berths"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Feedback & Experience *
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other travelers about the driving quality, charging ports, cleanliness, rest stops, etc..."
              required
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-amber-500 outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className="fill-white" />}
              <span>{submitting ? 'Submitting...' : 'Post Verified Review'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReviewModal;
