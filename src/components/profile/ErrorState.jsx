import { Bus, User, RefreshCw } from "lucide-react";

const ErrorState = ({ onRetry }) => (
  <div className="min-h-screen bg-white text-gray-900">
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Bus size={18} className="text-white" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-semibold text-gray-900 hidden sm:block">TicketDot</span>
        </div>
      </div>
    </header>
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-10 flex flex-col items-center text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <User size={22} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <p className="text-base font-semibold text-gray-900">Unable to load profile</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Something went wrong while fetching your profile data.</p>
          <button
            onClick={onRetry}
            className="h-10 px-5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={15} strokeWidth={1.5} />
            Retry
          </button>
        </div>
      </div>
    </main>
  </div>
);

export default ErrorState;