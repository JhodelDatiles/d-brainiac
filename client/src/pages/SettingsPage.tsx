import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/UseAuth";
import { useTheme } from "../context/UseTheme";

export default function Settings() {
  const { logout, changePassword, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const deleteDialog = useRef<HTMLDialogElement>(null);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (next.length < 8)
      return setPwError("New password must be at least 8 characters.");
    if (next !== confirm) return setPwError("New passwords do not match.");

    setPwLoading(true);
    try {
      await changePassword(current, next);
      setPwSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setPwError("Could not change password. Check your current password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/", { replace: true });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="opacity-70">Manage your account and preferences.</p>
      </div>

      {/* Theme */}
      <section className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">Theme</h2>
          <label className="flex cursor-pointer items-center justify-between">
            <span>
              {theme === "dark" ? "🌙 Dark mode" : "☀️ Light mode"}
              <span className="block text-sm opacity-70">
                Switch between light and dark appearance.
              </span>
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={theme === "dark"}
              onChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </label>
        </div>
      </section>

      {/* Change password */}
      <form onSubmit={handlePassword} className="card card-border bg-base-100">
        <div className="card-body gap-3">
          <h2 className="card-title">Change password</h2>

          {pwError && (
            <div role="alert" className="alert alert-error alert-soft">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div role="alert" className="alert alert-success alert-soft">
              Password updated.
            </div>
          )}

          <label className="floating-label">
            <span>Current password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Current password"
              className="input w-full"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </label>
          <label className="floating-label">
            <span>New password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="New password"
              className="input w-full"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </label>
          <label className="floating-label">
            <span>Confirm new password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="Confirm new password"
              className="input w-full"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>

          <div className="card-actions justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={pwLoading}
            >
              {pwLoading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              Update password
            </button>
          </div>
        </div>
      </form>

      {/* Session & danger zone */}
      <section className="card card-border bg-base-100">
        <div className="card-body gap-4">
          <h2 className="card-title">Account</h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Logout</p>
              <p className="text-sm opacity-70">
                Sign out and return to the landing page.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <div className="divider my-0" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-error">Delete account</p>
              <p className="text-sm opacity-70">
                Permanently delete your account. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-error"
              onClick={() => deleteDialog.current?.showModal()}
            >
              Delete
            </button>
          </div>
        </div>
      </section>

      {/* Delete confirmation */}
      <dialog ref={deleteDialog} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Delete your account?</h3>
          <p className="py-4">
            This will permanently remove your account and all of its data. This
            action cannot be undone.
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
            <button
              type="button"
              className="btn btn-error"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && (
                <span className="loading loading-spinner loading-sm" />
              )}
              Yes, delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </div>
  );
}
