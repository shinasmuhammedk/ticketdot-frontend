import { Edit3, Ticket, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "My Bookings", icon: Ticket, path: "/my-bookings" },
    { label: "Search Buses", icon: MapPin, path: "/dashboard" },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Edit3 size={15} className="text-blue-600" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
      </div>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="w-full h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <action.icon size={16} strokeWidth={1.5} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;