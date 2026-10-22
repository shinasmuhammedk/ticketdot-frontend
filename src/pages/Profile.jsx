import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile, updateProfile } from "../api/profile";
import { getMyBookings } from "../api/bookings";
import api from "../api/axiosInstance";
import Toast from "./Toast";
import Navbar from "../components/Navbar";
import {
  User, Mail, Phone, Shield, Calendar, CheckCircle2,
  Lock, Armchair, Bell, ArrowRight, LogOut, Edit3,
  Copy, Check, Loader2, Sparkles, Ticket
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [originalData, setOriginalData] = useState({ name: "", phone: "" });
  const [toast, setToast] = useState(null);

  // Travel preferences state
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("traveler_preferences");
      return saved ? JSON.parse(saved) : { seat: "window", whatsapp: true, email: true };
    } catch {
      return { seat: "window", whatsapp: true, email: true };
    }
  });

  const loadProfile = useCallback(async () => {
    try {
      const [profileRes, bookingsRes] = await Promise.allSettled([
        getProfile(),
        getMyBookings(),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data?.data) {
        const data = profileRes.value.data.data;
        setProfile(data);
        const initial = { name: data.name || "", phone: data.phone || "" };
        setFormData(initial);
        setOriginalData(initial);
      } else {
        setError(true);
      }

      if (bookingsRes.status === "fulfilled" && bookingsRes.value.data?.data) {
        setBookingCount(bookingsRes.value.data.data.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([getProfile(), getMyBookings()])
      .then(([profileRes, bookingsRes]) => {
        if (ignore) return;
        if (profileRes.status === "fulfilled" && profileRes.value.data?.data) {
          const data = profileRes.value.data.data;
          setProfile(data);
          const initial = { name: data.name || "", phone: data.phone || "" };
          setFormData(initial);
          setOriginalData(initial);
        } else {
          setError(true);
        }

        if (bookingsRes.status === "fulfilled" && bookingsRes.value.data?.data) {
          setBookingCount(bookingsRes.value.data.data.length || 0);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          setError(true);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch {
      // Ignored
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const handleSave = useCallback(async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      await loadProfile();
      setEditing(false);
      setToast("Profile saved successfully");
    } catch (err) {
      console.error(err);
      setToast("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }, [formData, loadProfile]);

  const handleCancel = () => {
    setFormData(originalData);
    setEditing(false);
  };

  const updatePreference = (key, val) => {
    const updated = { ...preferences, [key]: val };
    setPreferences(updated);
    localStorage.setItem("traveler_preferences", JSON.stringify(updated));
    setToast("Preference saved");
  };

  const copyUserId = () => {
    if (profile?.id) {
      navigator.clipboard.writeText(profile.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full animate-pulse space-y-6">
          <div className="h-6 w-36 bg-zinc-100 rounded-lg" />
          <div className="h-4 w-64 bg-zinc-100 rounded-md" />
          <div className="h-40 w-full bg-zinc-100 rounded-2xl" />
          <div className="h-64 w-full bg-zinc-100 rounded-2xl" />
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto">
            <User size={20} />
          </div>
          <h2 className="text-base font-bold text-zinc-900">Failed to load profile</h2>
          <p className="text-xs text-zinc-500">We were unable to retrieve your account details. Please try again.</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold cursor-pointer"
          >
            Retry
          </button>
        </main>
      </div>
    );
  }

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "U";
  const isOperator = profile.role === "operator_admin";
  const memberDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        
        {/* Page Title & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Account Settings</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Personal credentials, journey preferences, and session controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="h-8.5 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Edit3 size={13} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="h-8.5 px-3 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-8.5 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Identity Overview Row */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900">{profile.name}</span>
                {profile.email_verified && (
                  <CheckCircle2 size={14} className="text-emerald-600" title="Verified" />
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 text-zinc-700 capitalize">
              {profile.role?.replaceAll('_', ' ')}
            </span>
          </div>
        </div>

        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Personal Information
            </h2>
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {/* Full Name */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-zinc-500 sm:w-44">Full Name</span>
              <div className="flex-1">
                {!editing ? (
                  <span className="font-semibold text-zinc-900">{profile.name || '—'}</span>
                ) : (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full sm:max-w-xs h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-900 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none"
                  />
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-zinc-500 sm:w-44">Email Address</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="font-semibold text-zinc-900">{profile.email}</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  Primary
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-zinc-500 sm:w-44">Phone Number</span>
              <div className="flex-1">
                {!editing ? (
                  <span className="font-semibold text-zinc-900">{profile.phone || 'Not added'}</span>
                ) : (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 Mobile number"
                    className="w-full sm:max-w-xs h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-900 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none"
                  />
                )}
              </div>
            </div>

            {/* Account ID */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-zinc-500 sm:w-44">Account ID</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-600">{profile.id}</span>
                <button
                  type="button"
                  onClick={copyUserId}
                  className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-0.5"
                  title="Copy User ID"
                >
                  {copiedId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Member Since */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-zinc-500 sm:w-44">Joined On</span>
              <div className="flex-1">
                <span className="font-semibold text-zinc-900">{memberDate}</span>
              </div>
            </div>

            {/* Total Journeys */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-zinc-500 sm:w-44">Total Bookings</span>
              <div className="flex-1 flex items-center justify-between sm:justify-start gap-4">
                <span className="font-bold text-zinc-900">{bookingCount} confirmed trip{bookingCount !== 1 ? 's' : ''}</span>
                <Link
                  to="/my-bookings"
                  className="text-zinc-900 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                >
                  <span>View Trips</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Journey Preferences */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Travel Preferences
            </h2>
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {/* Preferred Seat Placement */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-zinc-800 block">Preferred Seating</span>
                <span className="text-[11px] text-zinc-400">Default filter when reserving bus berths</span>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => updatePreference("seat", "window")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    preferences.seat === "window"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Window Seat
                </button>
                <button
                  type="button"
                  onClick={() => updatePreference("seat", "aisle")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    preferences.seat === "aisle"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Aisle Seat
                </button>
              </div>
            </div>

            {/* Notification Delivery */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-zinc-800 block">WhatsApp E-Tickets</span>
                <span className="text-[11px] text-zinc-400">Receive boarding pass directly on WhatsApp</span>
              </div>

              <input
                type="checkbox"
                checked={preferences.whatsapp}
                onChange={(e) => updatePreference("whatsapp", e.target.checked)}
                className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
              />
            </div>

            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-zinc-800 block">Email Invoices & PDFs</span>
                <span className="text-[11px] text-zinc-400">Receive tax invoice upon booking confirmation</span>
              </div>

              <input
                type="checkbox"
                checked={preferences.email}
                onChange={(e) => updatePreference("email", e.target.checked)}
                className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Security & Session */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Security & Credentials
            </h2>
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {/* Password */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-zinc-800 block">Password</span>
                <span className="text-[11px] text-zinc-400">Last updated with encrypted bcrypt salt</span>
              </div>

              <Link
                to="/forgot-password"
                className="h-8 px-3 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-white text-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Lock size={12} />
                <span>Reset Password</span>
              </Link>
            </div>

            {/* Active Session */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-zinc-800 block">Device Session</span>
                <span className="text-[11px] text-zinc-400">Current browser authenticated via JWT</span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Sign Out / Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-200/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider">Sign Out</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Clear your authentication token and terminate session on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="h-9 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Profile;