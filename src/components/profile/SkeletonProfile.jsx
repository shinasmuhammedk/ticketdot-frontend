import { Bus } from "lucide-react";

const SkeletonProfile = () => (
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
      <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-8" />
      <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-4 w-56 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default SkeletonProfile;