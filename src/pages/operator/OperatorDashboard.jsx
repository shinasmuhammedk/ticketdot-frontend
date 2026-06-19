import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  Route,
  CalendarDays,
  Ticket,
  ChevronRight
} from 'lucide-react';

const OperatorDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Create Bus',
      description: 'Add a new bus to your fleet',
      icon: Bus,
      path: '/operator/create-bus',
    },
    {
      title: 'Create Route',
      description: 'Add source and destination routes',
      icon: Route,
      path: '/operator/create-route',
    },
    {
      title: 'Create Schedule',
      description: 'Create bus schedules and timings',
      icon: CalendarDays,
      path: '/operator/create-schedule',
    },
    {
      title: 'View Bookings',
      description: 'See all passenger bookings',
      icon: Ticket,
      path: '/operator/bookings',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-[#101F33] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold">
            Operator Dashboard
          </h1>
          <p className="text-stone-300 mt-2">
            Manage buses, routes, schedules and bookings.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#101F33]/10 flex items-center justify-center mb-4">
                      <Icon className="text-[#101F33]" size={24} />
                    </div>

                    <h2 className="text-xl font-semibold text-stone-900">
                      {card.title}
                    </h2>

                    <p className="text-stone-500 mt-2">
                      {card.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(card.path)}
                  className="mt-6 w-full h-11 rounded-xl bg-[#101F33] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#1A2D47] transition-colors"
                >
                  Open
                  <ChevronRight size={18} />
                </button>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;