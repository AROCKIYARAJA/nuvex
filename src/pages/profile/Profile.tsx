import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import {
  getProfile,
  resetDB,
  updateProfile,
  type UserProfile,
} from "@/services/service-api";
import { SkeletonCard } from "@/components/common/Skeletons";
import { NUM } from "@/constants/num-constants";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/route-constants";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [delLoading, setDelLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await getProfile());
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openModal = () => {
    setForm({ name: profile?.name || "", email: profile?.email || "" });
    setErrors({});
    setModalOpen(true);
  };

  const resetDBReq = () => {
    setDelLoading(true);
    resetDB().then((res) => {
      if (res.success) {
        setDelLoading(false);
        navigate(ROUTES.HOME);
      }
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.name.length > NUM.MAX_NAME_LENGTH)
      errs.name = `Max ${NUM.MAX_NAME_LENGTH} characters`;
    if (!form.email.trim()) errs.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setProfile(updated);
      toast.success("Profile updated!", {
        duration: NUM.TOAST_SUCCESS_DURATION,
      });
      setModalOpen(false);
    } catch {
      toast.error("Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  const completionFields = [profile?.name, profile?.email].filter(
    Boolean,
  ).length;
  const completionPct = Math.round(
    (completionFields / NUM.PROFILE_COMPLETION_FIELDS) * 100,
  );

  if (loading)
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <PageHeader title="Profile" />
        <SkeletonCard />
      </div>
    );

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <PageHeader title="Profile" subtitle="Manage your information" />

      <div className="bg-card border border-border rounded-xl shadow-card p-6 text-center">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold font-display mx-auto mb-4">
          {profile?.name ? (
            profile.name[0].toUpperCase()
          ) : (
            <i className="bx bx-user text-3xl" />
          )}
        </div>
        <h2 className="text-xl font-bold font-display text-foreground">
          {profile?.name || "Unknown User"}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {profile?.email || "No email set"}
        </p>

        {/* Completion meter */}
        <div className="mt-4 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Profile Completion</span>
            <span>{completionPct}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={openModal}
            className="mt-6 gradient-primary text-primary-foreground text-sm font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <i className="bx bx-edit" />{" "}
            {profile?.name ? "Edit Profile" : "Add User Information"}
          </button>
          <button
            onClick={resetDBReq}
            disabled={delLoading}
            className="mt-6 bg-red-600 text-primary-foreground text-sm font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {delLoading ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Deleting...
              </>
            ) : (
              <> Delete All Records</>
            )}
          </button>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@email.com"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="w-full gradient-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Saving...
              </>
            ) : (
              <>
                <i className="bx bx-check" /> Save
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
