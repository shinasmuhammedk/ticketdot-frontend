import React from "react";
import { Ticket, Compass, KeyRound, LayoutDashboard, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const QuickActions = ({ role }) => {
  const isOperator = role === "operator_admin";

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Quick Shortcuts</h3>
        <p className="text-xs text-slate-400 mt-0.5">Frequent actions and portal tools</p>
      </div>

      <div className="space-y-2.5">
        <Link
          to="/my-bookings"
          className="w-full h-11 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Ticket size={14} />
            </div>
            <span>My Bookings</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/dashboard"
          className="w-full h-11 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Compass size={14} />
            </div>
            <span>Explore Buses</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/forgot-password"
          className="w-full h-11 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <KeyRound size={14} />
            </div>
            <span>Change / Reset Password</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {isOperator && (
          <Link
            to="/operator/dashboard"
            className="w-full h-11 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <LayoutDashboard size={14} />
              </div>
              <span>Operator Dashboard</span>
            </div>
            <ArrowRight size={14} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default QuickActions;