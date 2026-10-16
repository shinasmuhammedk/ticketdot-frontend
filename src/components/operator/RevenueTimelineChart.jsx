import React, { useState } from 'react';
import { IndianRupee, Ticket, TrendingUp, BarChart3, LineChart } from 'lucide-react';

const RevenueTimelineChart = ({ dailyData = [] }) => {
  const [chartMode, setChartMode] = useState('revenue'); // 'revenue' | 'tickets'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
        <TrendingUp size={28} className="mb-2 text-zinc-300 stroke-[1.5]" />
        <p className="text-xs font-semibold text-zinc-600">No revenue data available</p>
        <p className="text-[11px] text-zinc-400">Scheduled trips and bookings will populate this chart.</p>
      </div>
    );
  }

  // Dimensions & bounds
  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max values
  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue || 0), 100);
  const maxTickets = Math.max(...dailyData.map((d) => d.tickets_sold || 0), 10);
  const activeMax = chartMode === 'revenue' ? maxRevenue : maxTickets;

  // Format short date: "2026-10-15" -> "15 Oct"
  const formatShortDate = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Calculate points for line/area
  const points = dailyData.map((d, i) => {
    const val = chartMode === 'revenue' ? (d.revenue || 0) : (d.tickets_sold || 0);
    const x = dailyData.length === 1 
      ? width / 2 
      : paddingX + (i / (dailyData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (val / activeMax) * chartHeight;
    return { x, y, val, item: d, index: i };
  });

  // Construct SVG paths
  const linePath = points.length > 0 
    ? points.reduce((acc, p, idx) => {
        if (idx === 0) return `M ${p.x} ${p.y}`;
        // Smooth bezier curve control points
        const prev = points[idx - 1];
        const cp1x = prev.x + (p.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (p.x - prev.x) / 2;
        const cp2y = p.y;
        return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
      }, '')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Y-axis tick intervals
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => ({
    pct,
    y: paddingTop + chartHeight - pct * chartHeight,
    val: chartMode === 'revenue'
      ? `₹${Math.round(activeMax * pct).toLocaleString('en-IN')}`
      : `${Math.round(activeMax * pct)}`,
  }));

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {chartMode === 'revenue' ? 'Revenue Timeline' : 'Ticket Sales Volume'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
              {dailyData.length} Days
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {chartMode === 'revenue'
              ? 'Aggregated confirmed earnings from passenger manifests'
              : 'Seat reservations issued across all active corridors'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setChartMode('revenue');
              setHoveredIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartMode === 'revenue'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <LineChart size={13} />
            <span>Revenue (₹)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setChartMode('tickets');
              setHoveredIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartMode === 'tickets'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <BarChart3 size={13} />
            <span>Tickets Sold</span>
          </button>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible"
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Horizontal Guidelines & Y-labels */}
          {yTicks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={t.y}
                x2={width - paddingX}
                y2={t.y}
                stroke="#f4f4f5"
                strokeWidth="1"
                strokeDasharray={idx > 0 && idx < yTicks.length - 1 ? '4 4' : undefined}
              />
              <text
                x={paddingX - 8}
                y={t.y + 3}
                textAnchor="end"
                className="text-[9px] fill-zinc-400 font-medium"
              >
                {t.val}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path
            d={areaPath}
            fill={chartMode === 'revenue' ? 'url(#revenueGrad)' : 'url(#ticketGrad)'}
            className="transition-all duration-300"
          />

          {/* Curved Line */}
          <path
            d={linePath}
            fill="none"
            stroke={chartMode === 'revenue' ? '#18181b' : '#2563eb'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Data Points & Invisible Touch targets */}
          {points.map((p) => {
            const isHovered = hoveredIndex === p.index;
            return (
              <g key={p.index}>
                {/* Vertical Guideline on hover */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + chartHeight}
                    stroke="#a1a1aa"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill={chartMode === 'revenue' ? '#18181b' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150 cursor-pointer"
                />

                {/* Invisible hover trigger area */}
                <rect
                  x={p.x - chartWidth / (dailyData.length * 2)}
                  y={paddingTop}
                  width={chartWidth / dailyData.length}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(p.index)}
                  onTouchStart={() => setHoveredIndex(p.index)}
                />
              </g>
            );
          })}

          {/* X-axis Date Labels */}
          {points.map((p, idx) => {
            // Label density: show every point if <= 7, or every 4-5 points if 30
            const step = dailyData.length > 10 ? Math.ceil(dailyData.length / 6) : 1;
            const isVisible = idx === 0 || idx === points.length - 1 || idx % step === 0;

            if (!isVisible) return null;

            return (
              <text
                key={idx}
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] fill-zinc-400 font-medium"
              >
                {formatShortDate(p.item.date)}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip Pill */}
        {activePoint && (
          <div
            className="pointer-events-none absolute z-20 transform -translate-x-1/2 -translate-y-full transition-all duration-75"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100 - 4}%`,
            }}
          >
            <div className="bg-zinc-900 text-white px-3 py-2 rounded-xl shadow-lg border border-zinc-800 text-xs min-w-[130px]">
              <p className="text-[10px] text-zinc-400 font-medium mb-1">
                {formatShortDate(activePoint.item.date)}
              </p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                  <IndianRupee size={11} /> Revenue:
                </span>
                <span className="font-bold text-white">
                  ₹{Number(activePoint.item.revenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 mt-0.5">
                <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                  <Ticket size={11} /> Tickets:
                </span>
                <span className="font-bold text-zinc-200">
                  {activePoint.item.tickets_sold || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueTimelineChart;
