import React, { useEffect, useState } from 'react';
import {
  Star, MessageSquare, Reply, CheckCircle2, Clock,
  Filter, AlertCircle, Loader2, Send, ThumbsUp, Sparkles, User
} from 'lucide-react';
import OperatorLayout from '../../components/operator/OperatorLayout';
import { getOperatorReviews, replyToReview } from '../../api/reviews';
import Toast from '../Toast';

const OperatorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Replying state
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Filter
  const [starFilter, setStarFilter] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOperatorReviews();
      setReviews(res.data?.data?.reviews || []);
    } catch (err) {
      setError('Failed to load passenger reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await replyToReview(reviewId, replyText.trim());
      setToastMessage('Official reply successfully posted!');
      setActiveReplyId(null);
      setReplyText('');
      fetchReviews();
    } catch (err) {
      setToastMessage('Failed to post reply: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filtered list
  const filtered = reviews.filter((r) => {
    if (starFilter === 'all') return true;
    const s = Math.floor(r.rating);
    return s === Number(starFilter);
  });

  // Calculate stats
  const total = reviews.length;
  const avgRating = total > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
    : '5.0';

  const avgCleanliness = total > 0
    ? (reviews.reduce((acc, r) => acc + r.cleanliness_rating, 0) / total).toFixed(1)
    : '5.0';

  const avgPunctuality = total > 0
    ? (reviews.reduce((acc, r) => acc + r.punctuality_rating, 0) / total).toFixed(1)
    : '5.0';

  const repliedCount = reviews.filter(r => Boolean(r.operator_reply)).length;

  return (
    <OperatorLayout
      title="Passenger Ratings & Reviews"
      subtitle="Monitor customer satisfaction, ratings breakdown, and post official replies"
    >
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Average Fleet Rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star size={16} className="fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900">{avgRating}</span>
            <span className="text-xs font-bold text-zinc-400">/ 5.0</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">From {total} verified passenger trips</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cleanliness Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900">{avgCleanliness}</span>
            <span className="text-xs font-bold text-zinc-400">★</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Sanitization & Hygiene</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Punctuality Score</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900">{avgPunctuality}</span>
            <span className="text-xs font-bold text-zinc-400">★</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">On-Time Departures</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Feedback Replied</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900">
              {total > 0 ? Math.round((repliedCount / total) * 100) : 100}%
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">{repliedCount} of {total} reviews answered</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-3">
        {['all', '5', '4', '3', '2', '1'].map((star) => (
          <button
            key={star}
            onClick={() => setStarFilter(star)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              starFilter === star
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <span>{star === 'all' ? 'All Reviews' : `${star} Stars`}</span>
            {star !== 'all' && <Star size={11} className={starFilter === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />}
          </button>
        ))}
      </div>

      {/* Reviews Content */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200">
          <Loader2 size={32} className="animate-spin text-zinc-900 mx-auto mb-3" />
          <p className="text-xs font-bold text-zinc-500">Loading passenger feedback...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200">
          <MessageSquare size={36} className="text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900">No reviews found</h3>
          <p className="text-xs text-zinc-400 mt-1">Passenger ratings will appear here as trips are completed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-700 font-black text-xs flex items-center justify-center">
                    {rev.user_name ? rev.user_name.slice(0, 2).toUpperCase() : 'PS'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{rev.user_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Verified Ticket #{rev.booking_ref}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Route: {rev.origin} ➔ {rev.destination} • Vehicle: {rev.bus_type?.replaceAll('_', ' ')} • {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black self-start sm:self-auto">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{rev.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {/* Sub-ratings breakdown strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-[11px] text-zinc-500 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                <span>Cleanliness: <strong className="text-zinc-800">{rev.cleanliness_rating}★</strong></span>
                <span>Punctuality: <strong className="text-zinc-800">{rev.punctuality_rating}★</strong></span>
                <span>Comfort: <strong className="text-zinc-800">{rev.comfort_rating}★</strong></span>
                <span>Staff: <strong className="text-zinc-800">{rev.staff_rating}★</strong></span>
              </div>

              {rev.headline && (
                <h4 className="text-sm font-bold text-zinc-900 mb-1">
                  {rev.headline}
                </h4>
              )}

              <p className="text-xs text-zinc-600 leading-relaxed">
                {rev.comment}
              </p>

              {/* Existing Operator Response or Reply Input */}
              {rev.operator_reply ? (
                <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Reply size={13} className="text-zinc-500" />
                      <span>Official Operator Response</span>
                    </span>
                    <span className="text-zinc-400 font-normal">
                      {rev.operator_replied_at ? new Date(rev.operator_replied_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    {rev.operator_reply}
                  </p>
                </div>
              ) : activeReplyId === rev.id ? (
                <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                    Compose Response to Passenger
                  </label>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank the passenger or address their concern constructively..."
                    className="w-full p-2.5 rounded-lg border border-zinc-200 text-xs text-zinc-800 bg-white focus:border-zinc-900 outline-none resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-semibold hover:bg-zinc-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReply(rev.id)}
                      disabled={submittingReply || !replyText.trim()}
                      className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {submittingReply ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>Post Response</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setActiveReplyId(rev.id); setReplyText(''); }}
                    className="text-xs font-bold text-zinc-700 hover:text-zinc-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <Reply size={13} />
                    <span>Reply to Feedback</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </OperatorLayout>
  );
};

export default OperatorReviews;
