import React from "react";
import { User, RotateCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";

const ErrorState = ({ onRetry }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <Navbar />

    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full flex items-center justify-center">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl p-8 sm:p-10 flex flex-col items-center text-center max-w-sm w-full animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <User size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Unable to Load Profile</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
          We encountered an issue fetching your profile credentials. Please verify your connection and try again.
        </p>

        <div className="space-y-2 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCw size={14} />
            <span>Try Again</span>
          </button>

          <Link
            to="/dashboard"
            className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  </div>
);

export default ErrorState;