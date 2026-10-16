import React, { useState } from 'react';
import { Route, Bus, Users, IndianRupee, ArrowRight, Percent, Award } from 'lucide-react';

const RouteFleetAnalytics = ({ routeOccupancy = [], busUtilization = [] }) => {
  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'fleet'

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {activeTab === 'routes' ? 'Corridor Occupancy & Yield' : 'Fleet Vehicle Utilization'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
              {activeTab === 'routes' ? `${routeOccupancy.length} Routes` : `${busUtilization.length} Vehicles`}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {activeTab === 'routes'
              ? 'Seat inventory fill-rate and earnings across city pairs'
              : 'Trip volume, capacity utilization, and revenue per bus asset'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'routes'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Route size={13} />
            <span>Corridors</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'fleet'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Bus size={13} />
            <span>Fleet Assets</span>
          </button>
        </div>
      </div>

      {/* Tab: Routes Occupancy */}
      {activeTab === 'routes' && (
        <div>
          {routeOccupancy.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
              <Route size={24} className="mb-2 text-zinc-300 stroke-[1.5]" />
              <p className="text-xs font-semibold text-zinc-600">No route performance data yet</p>
              <p className="text-[11px] text-zinc-400">Routes with active departures will show occupancy trends.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {routeOccupancy.map((r, idx) => {
                const rate = Math.min(Math.round(r.occupancy_rate || 0), 100);
                const isHigh = rate >= 75;
                const isMid = rate >= 40 && rate < 75;

                return (
                  <div key={r.route_id || idx} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900">
                          <span>{r.origin_city}</span>
                          <ArrowRight size={13} className="text-zinc-400" />
                          <span>{r.destination_city}</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-medium ml-1">
                          ({r.total_schedules} {r.total_schedules === 1 ? 'trip' : 'trips'})
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-[11px] text-zinc-400 block font-normal">Revenue</span>
                          <span className="font-bold text-zinc-900">
                            ₹{Number(r.revenue || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right min-w-[70px]">
                          <span className="text-[11px] text-zinc-400 block font-normal">Occupancy</span>
                          <span
                            className={`font-bold inline-flex items-center gap-0.5 ${
                              isHigh
                                ? 'text-emerald-600'
                                : isMid
                                ? 'text-blue-600'
                                : 'text-zinc-600'
                            }`}
                          >
                            {rate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh
                              ? 'bg-emerald-500'
                              : isMid
                              ? 'bg-blue-500'
                              : 'bg-zinc-400'
                          }`}
                          style={{ width: `${Math.max(rate, 2)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap font-medium min-w-[95px] text-right">
                        {r.total_seats_booked} / {r.total_capacity} seats
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Fleet Assets Utilization */}
      {activeTab === 'fleet' && (
        <div>
          {busUtilization.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
              <Bus size={24} className="mb-2 text-zinc-300 stroke-[1.5]" />
              <p className="text-xs font-semibold text-zinc-600">No fleet utilization data yet</p>
              <p className="text-[11px] text-zinc-400">Add buses and assign them to trip schedules.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {busUtilization.map((b, idx) => {
                const util = Math.min(Math.round(b.utilization_rate || 0), 100);
                const isHigh = util >= 75;
                const isMid = util >= 40 && util < 75;

                return (
                  <div key={b.bus_id || idx} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold text-xs">
                          <Bus size={15} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-900 tracking-tight">
                              {b.bus_number}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 uppercase">
                              {b.bus_type}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            {b.total_trips} {b.total_trips === 1 ? 'trip completed' : 'trips completed'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-[11px] text-zinc-400 block font-normal">Yield</span>
                          <span className="font-bold text-zinc-900">
                            ₹{Number(b.revenue || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right min-w-[70px]">
                          <span className="text-[11px] text-zinc-400 block font-normal">Utilization</span>
                          <span
                            className={`font-bold inline-flex items-center gap-0.5 ${
                              isHigh
                                ? 'text-emerald-600'
                                : isMid
                                ? 'text-blue-600'
                                : 'text-zinc-600'
                            }`}
                          >
                            {util}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh
                              ? 'bg-emerald-500'
                              : isMid
                              ? 'bg-blue-500'
                              : 'bg-zinc-400'
                          }`}
                          style={{ width: `${Math.max(util, 2)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap font-medium min-w-[95px] text-right">
                        {b.seats_booked} / {b.total_capacity} seats
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteFleetAnalytics;
