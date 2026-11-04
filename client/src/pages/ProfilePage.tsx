import { useActionState, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router";
import Avatar from "../components/Avatar";
import { GENDER_OPTIONS, type Gender } from "../context/AuthContext";
import { useAuth } from "../context/UseAuth";
import { getErrorMessage } from "../lib/api";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface SaveState {
  ok: boolean;
  error: string;
}

export default function Profile() {
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [state, submit, saving] = useActionState(
    async (_prev: SaveState, formData: FormData): Promise<SaveState> => {
      try {
        await updateProfile({
          name: String(formData.get("name") ?? ""),
          bio: String(formData.get("bio") ?? ""),
          gender: String(formData.get("gender") ?? "") as Gender,
        });
        return { ok: true, error: "" };
      } catch (err) {
        return {
          ok: false,
          error: getErrorMessage(err, "Could not update your profile."),
        };
      }
    },
    { ok: false, error: "" },
  );

  if (!user) return null;

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError("");
    if (!ALLOWED.includes(file.type))
      return setAvatarError("Use a JPEG, PNG or WebP image.");
    if (file.size > MAX_BYTES)
      return setAvatarError("Image must be 2 MB or smaller.");

    setAvatarBusy(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setAvatarError(getErrorMessage(err, "Could not upload the image."));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemove = async () => {
    setAvatarError("");
    setAvatarBusy(true);
    try {
      await removeAvatar();
    } catch (err) {
      setAvatarError(getErrorMessage(err, "Could not remove the image."));
    } finally {
      setAvatarBusy(false);
    }
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

      <div className="card card-border bg-base-100">
        <div className="card-body gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            <div className="space-y-2">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm opacity-70">{user.email}</p>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept={ALLOWED.join(",")}
                className="hidden"
                onChange={handleFile}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={avatarBusy}
                  onClick={() => fileInput.current?.click()}
                >
                  {avatarBusy && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  {user.avatarUrl ? "Change photo" : "Upload photo"}
                </button>
                {user.avatarUrl && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={avatarBusy}
                    onClick={handleRemove}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          {avatarError && (
            <div role="alert" className="alert alert-error alert-soft">
              {avatarError}
            </div>
          )}
        </div>
      </div>

      <form action={submit} className="card card-border bg-base-100">
        <div className="card-body gap-4">
          {state.ok && !state.error && (
            <div role="alert" className="alert alert-success alert-soft">
              Profile updated.
            </div>
          )}
          {state.error && (
            <div role="alert" className="alert alert-error alert-soft">
              {state.error}
            </div>
          )}

          <label className="floating-label">
            <span>Name</span>
            <input
              name="name"
              type="text"
              required
              maxLength={50}
              placeholder="Name"
              className="input w-full"
              defaultValue={user.name}
            />
          </label>

          <label className="floating-label">
            <span>Email</span>
            <input
              type="email"
              disabled
              placeholder="Email"
              className="input w-full"
              value={user.email}
              readOnly
            />
          </label>

          <label className="floating-label">
            <span>Gender</span>
            <select
              name="gender"
              className="select w-full"
              defaultValue={user.gender}
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="floating-label">
            <span>Bio</span>
            <textarea
              name="bio"
              placeholder="Bio"
              rows={4}
              maxLength={300}
              className="textarea w-full"
              defaultValue={user.bio}
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
