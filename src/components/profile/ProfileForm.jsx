import { User, Mail, Phone, Shield, Calendar, CheckCircle2, Loader2, X, Check } from "lucide-react";

const FIELD_CONFIG = [
  { key: "name", label: "Full Name", icon: User, color: "bg-blue-50 text-blue-600", editable: true },
  { key: "phone", label: "Phone Number", icon: Phone, color: "bg-amber-50 text-amber-600", editable: true },
  { key: "email", label: "Email Address", icon: Mail, color: "bg-emerald-50 text-emerald-600", editable: false },
  { key: "role", label: "Account Role", icon: Shield, color: "bg-purple-50 text-purple-600", editable: false },
  {
    key: "email_verified",
    label: "Email Verification",
    icon: CheckCircle2,
    color: (v) => (v ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"),
    editable: false,
    format: (v) => (v ? "Verified" : "Not verified"),
  },
  {
    key: "created_at",
    label: "Member Since",
    icon: Calendar,
    color: "bg-gray-50 text-gray-600",
    editable: false,
    format: (v) =>
      v
        ? new Date(v).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "—",
  },
];

const ReadOnlyRow = ({ item, value }) => {
  const Icon = item.icon;
  const color = typeof item.color === "function" ? item.color(value) : item.color;
  const display = item.format ? item.format(value) : value || "—";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={16} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.label}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{display}</p>
        </div>
      </div>
    </div>
  );
};

const EditableRow = ({ item, value, onChange }) => {
  const Icon = item.icon;
  const color = typeof item.color === "function" ? item.color(value) : item.color;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <label className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={16} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{item.label}</p>
          <input
            type="text"
            name={item.key}
            value={value || ""}
            onChange={onChange}
            placeholder={`Enter ${item.label.toLowerCase()}`}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
      </label>
    </div>
  );
};

const ProfileForm = ({ profile, formData, editing, onChange, onSave, onCancel, saving }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELD_CONFIG.map((item) => {
          const value = editing && item.editable ? formData[item.key] : profile[item.key];
          return item.editable && editing ? (
            <EditableRow key={item.key} item={item} value={value} onChange={onChange} />
          ) : (
            <ReadOnlyRow key={item.key} item={item} value={value} />
          );
        })}
      </div>

      {editing && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X size={15} strokeWidth={1.5} />
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="h-10 px-5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={1.5} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;