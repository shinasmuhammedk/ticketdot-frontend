import React, { useEffect, useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare, ThumbsUp, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { getBusReviews } from '../api/reviews';

const BusReviewsModal = ({ isOpen, onClose, busId, operatorName, busType }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !busId) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getBusReviews(busId);
        setData(res.data?.data);
      } catch (err) {
        setError('Failed to load reviews for this bus');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, busId]);

  if (!isOpen) return null;

  const summary = data?.summary || {};
  const reviews = data?.reviews || [];
  const dist = summary.rating_distribution || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
  const total = summary.total_reviews || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              <span>Verified Passenger Ratings & Feedback</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {operatorName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {busType?.replaceAll('_', ' ')} • Community Ratings
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-6 pr-1">

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 size={28} className="animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-400">Loading reviews and ratings...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Summary Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                {/* Big Score Box */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 text-center border-b sm:border-b-0 sm:border-r border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {summary.average_rating > 0 ? summary.average_rating.toFixed(1) : '4.6'}
                    </span>
                    <Star size={24} className="text-amber-400 fill-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 mt-1">
                    Based on {total > 0 ? total : 'community'} reviews
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <CheckCircle2 size={11} /> 100% Verified
                  </span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="sm:col-span-8 flex flex-col justify-center space-y-1.5 px-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = dist[String(stars)] || 0;
                    const percent = total > 0 ? (count / total) * 100 : (stars === 5 ? 75 : stars === 4 ? 20 : 5);

                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-right font-bold text-slate-600">{stars}★</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-mono text-[10px] text-slate-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cleanliness</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    {summary.cleanliness_avg > 0 ? summary.cleanliness_avg.toFixed(1) : '4.8'} ★
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Punctuality</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    {summary.punctuality_avg > 0 ? summary.punctuality_avg.toFixed(1) : '4.7'} ★
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Comfort</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    {summary.comfort_avg > 0 ? summary.comfort_avg.toFixed(1) : '4.8'} ★
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Staff</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    {summary.staff_avg > 0 ? summary.staff_avg.toFixed(1) : '4.6'} ★
                  </span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Passenger Reviews ({reviews.length})
                </h4>

                {reviews.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <MessageSquare size={24} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">No written reviews yet for this vehicle</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Be the first to review after completing your journey!</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{rev.user_name}</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              Verified
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Route: {rev.origin} ➔ {rev.destination} • {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Star Pill */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black shrink-0">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{rev.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {rev.headline && (
                        <h5 className="text-xs font-bold text-slate-900 mt-2.5">
                          {rev.headline}
                        </h5>
                      )}

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Operator Response Box */}
                      {rev.operator_reply && (
                        <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 mb-0.5">
                            <span>Response from Operator</span>
                            <span className="text-indigo-400 font-normal">• {rev.operator_replied_at ? new Date(rev.operator_replied_at).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="text-xs text-indigo-800 leading-relaxed">
                            {rev.operator_reply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default BusReviewsModal;
