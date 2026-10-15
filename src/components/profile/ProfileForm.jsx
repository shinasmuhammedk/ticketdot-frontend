import React from "react";
import { User, Mail, Phone, Shield, Calendar, CheckCircle2, Loader2, X, Check, Hash, Copy } from "lucide-react";

const FIELD_CONFIG = [
  { key: "name", label: "Full Name", icon: User, color: "bg-indigo-50 text-indigo-600", editable: true },
  { key: "phone", label: "Phone Number", icon: Phone, color: "bg-amber-50 text-amber-600", editable: true },
  { key: "email", label: "Email Address", icon: Mail, color: "bg-blue-50 text-blue-600", editable: false },
  { key: "role", label: "Account Role", icon: Shield, color: "bg-purple-50 text-purple-600", editable: false },
  {
    key: "id",
    label: "Account ID",
    icon: Hash,
    color: "bg-slate-100 text-slate-600",
    editable: false,
    format: (v) => v ? `${v.slice(0, 16)}...` : "—",
  },
  {
    key: "created_at",
    label: "Registration Date",
    icon: Calendar,
    color: "bg-emerald-50 text-emerald-600",
    editable: false,
    format: (v) =>
      v
        ? new Date(v).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
  },
];

const ReadOnlyRow = ({ item, value }) => {
  const Icon = item.icon;
  const display = item.format ? item.format(value) : value || "—";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 hover:border-slate-300 transition-colors shadow-2xs">
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{display}</p>
        </div>
      </div>
    </div>
  );
};

const EditableRow = ({ item, value, onChange }) => {
  const Icon = item.icon;

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color} mt-0.5`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            {item.label} (Editable)
          </label>
          <input
            type="text"
            name={item.key}
            value={value || ""}
            onChange={onChange}
            placeholder={`Enter ${item.label.toLowerCase()}`}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};

const ProfileForm = ({ profile, formData, editing, onChange, onSave, onCancel, saving }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
          <p className="text-xs text-slate-400 mt-0.5">Your verified account information and profile attributes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 animate-in fade-in">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="h-10 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <X size={15} />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;