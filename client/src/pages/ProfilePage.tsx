import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/UseAuth";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateProfile({ name, email, bio });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="opacity-70">
            View and update your personal information.
          </p>
        </div>
        <Link to="/settings" className="btn btn-outline btn-sm">
          Settings
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card card-border bg-base-100">
        <div className="card-body gap-4">
          <div className="flex items-center gap-4">
            <div className="avatar avatar-placeholder">
              <div className="w-16 rounded-full bg-primary text-primary-content">
                <span className="text-2xl uppercase">
                  {name.charAt(0) || "?"}
                </span>
              </div>
            </div>
            <div>
              <p className="font-semibold">{name || "Your name"}</p>
              <p className="text-sm opacity-70">{email}</p>
            </div>
          </div>

          {saved && (
            <div role="alert" className="alert alert-success alert-soft">
              Profile updated.
            </div>
          )}

          <label className="floating-label">
            <span>Name</span>
            <input
              type="text"
              required
              placeholder="Name"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="floating-label">
            <span>Email</span>
            <input
              type="email"
              required
              placeholder="Email"
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="floating-label">
            <span>Bio</span>
            <textarea
              placeholder="Bio"
              rows={4}
              className="textarea w-full"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          <div className="card-actions justify-end">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && (
                <span className="loading loading-spinner loading-sm" />
              )}
              Save changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
