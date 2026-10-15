import React from "react";
import { Edit3, CheckCircle2, ShieldCheck, Calendar, User, Shield } from "lucide-react";

const ProfileHeader = ({ profile, editing, onEdit, saving, bookingCount = 0 }) => {
  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : "U";
  const isOperator = profile?.role === "operator_admin";

  const memberSinceFormatted = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Decorative Brand Accent Banner */}
      <div className="h-28 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
          {/* Avatar & Identifiers */}
          <div className="flex items-end gap-4 min-w-0">
            <div className="w-22 h-22 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-black shrink-0">
              {initial}
            </div>

            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight truncate">
                  {profile.name}
                </h2>
                {profile.email_verified && (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" title="Verified Account" />
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {!editing ? (
            <button
              type="button"
              onClick={onEdit}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Editing Active</span>
            </div>
          )}
        </div>

        {/* Status Pills Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isOperator
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            <Shield size={12} />
            <span className="capitalize">{profile.role?.replaceAll('_', ' ')}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600">
            <Calendar size={12} className="text-slate-400" />
            <span>Member since {memberSinceFormatted}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Security Verified</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;