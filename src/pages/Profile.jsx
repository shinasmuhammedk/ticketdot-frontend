import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../api/profile";

import Toast from "./Toast";
import AppHeader from "../components/profile/AppHeader";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileForm from "../components/profile/ProfileForm";
import QuickActions from "../components/profile/QuickActions";
import AccountCard from "../components/profile/AccountCard";
import SkeletonProfile from "../components/profile/SkeletonProfile";
import ErrorState from "../components/profile/ErrorState";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [originalData, setOriginalData] = useState({ name: "", phone: "" });
  const [toast, setToast] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getProfile();
      const data = res.data.data;
      setProfile(data);
      const initial = { name: data.name || "", phone: data.phone || "" };
      setFormData(initial);
      setOriginalData(initial);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setFormData(originalData);
    setEditing(false);
  }, [originalData]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      await loadProfile();
      setEditing(false);
      setToast("Profile updated successfully");
    } catch (err) {
      console.error(err);
      setToast("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }, [formData, loadProfile]);

  if (loading) return <SkeletonProfile />;
  if (error || !profile) return <ErrorState onRetry={loadProfile} />;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account details and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileHeader
              profile={profile}
              editing={editing}
              onEdit={handleEdit}
              saving={saving}
            />
            <ProfileForm
              profile={profile}
              formData={formData}
              editing={editing}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
            />
          </div>

          <div className="space-y-4">
            <QuickActions />
            <AccountCard onLogout={handleLogout} />
          </div>
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Profile;