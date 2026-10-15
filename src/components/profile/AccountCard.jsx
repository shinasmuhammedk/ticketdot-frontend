import { Clock } from "lucide-react";

const AccountCard = ({ onLogout }) => (
  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
        <Clock size={15} className="text-gray-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">Account</h3>
    </div>
    <p className="text-xs text-gray-500 leading-relaxed">
      You can log out of your account here. You will need to sign in again to access your bookings.
    </p>
    <button
      onClick={onLogout}
      className="mt-4 w-full h-10 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
    >
      Logout
    </button>
  </div>
);

export default AccountCard;