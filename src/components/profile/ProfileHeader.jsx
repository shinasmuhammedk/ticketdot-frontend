import { Edit3 } from "lucide-react";

const ProfileHeader = ({ profile, editing, onEdit, saving }) => (
  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-semibold shrink-0">
          {profile.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{profile.name}</h2>
          <p className="text-sm text-gray-500 truncate">{profile.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700">
              <span className="w-1 h-1 rounded-full bg-blue-500" />
              {profile.role}
            </span>
            {profile.email_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
      {!editing && (
        <button
          onClick={onEdit}
          disabled={saving}
          className="shrink-0 h-10 px-4 rounded-xl bg-blue-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Edit3 size={15} strokeWidth={1.5} />
          Edit Profile
        </button>
      )}
    </div>
  </div>
);

export default ProfileHeader;