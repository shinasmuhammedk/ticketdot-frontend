import { Bus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = ["Dashboard", "My trips", "Offers"];
const NAV_PATHS = { Dashboard: "/dashboard", "My trips": "/my-bookings", Offers: "/offers" };

const AppHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Bus size={18} className="text-white" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-semibold text-gray-900 hidden sm:block">TicketDot</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((label) => (
            <button
              key={label}
              onClick={() => navigate(NAV_PATHS[label])}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;