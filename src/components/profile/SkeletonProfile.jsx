import React from "react";
import Navbar from "../Navbar";

const SkeletonProfile = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <Navbar />

    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full animate-pulse">
      <div className="h-7 w-48 bg-slate-200 rounded-xl mb-2" />
      <div className="h-4 w-72 bg-slate-200 rounded-lg mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 h-56" />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 h-72" />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 h-48" />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 h-48" />
        </div>
      </div>
    </main>
  </div>
);

export default SkeletonProfile;