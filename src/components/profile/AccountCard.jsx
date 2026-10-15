import React from "react";
import { ShieldCheck, LogOut, Lock } from "lucide-react";

const AccountCard = ({ onLogout }) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
        <Lock size={15} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900">Session & Security</h3>
        <p className="text-[11px] text-slate-400">Manage account access</p>
      </div>
    </div>

    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Active JWT Session (24h)</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Signing out will clear local authentication tokens. You will need to sign in again to access bookings.
      </p>
    </div>

    <button
      type="button"
      onClick={onLogout}
      className="w-full h-11 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
    >
      <LogOut size={15} />
      <span>Sign Out of TicketDot</span>
    </button>
  </div>
);

export default AccountCard;