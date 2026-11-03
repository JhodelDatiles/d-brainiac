import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/UseAuth";
import { getErrorMessage } from "../lib/api";

export default function Signup() {
  const { user, isLoading, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  if (isLoading) return null;
  if (user) return <Navigate to="/library" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password.length > 72)
      return setError("Password must be at most 72 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await signup(email, password, confirm);
      setSentTo(email.trim());
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not create your account. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="min-h-screen bg-base-200">
        <PublicNavbar />
        <div className="flex justify-center px-4 py-12">
          <div className="card card-border w-full max-w-md bg-base-100">
            <div className="card-body gap-3">
              <h1 className="card-title text-2xl">Check your email</h1>
              <p className="text-sm opacity-70">
                We sent a confirmation link to{" "}
                <span className="font-semibold">{sentTo}</span>. Click it to
                activate your account, then log in.
              </p>
              <p className="text-sm opacity-70">
                The link expires in 24 hours. Wrong address? Sign up again with
                the right one.
              </p>
              <div className="card-actions mt-2 justify-between">
                <button className="btn btn-ghost" onClick={() => setSentTo("")}>
                  Use a different email
                </button>
                <Link to="/login" className="btn btn-primary">
                  Go to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <PublicNavbar />
      <div className="flex justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="card card-border w-full max-w-md bg-base-100"
        >
          <div className="card-body gap-3">
            <h1 className="card-title text-2xl">Create your account</h1>
            <p className="text-sm opacity-70">
              Start building your library today.
            </p>

            {error && (
              <div role="alert" className="alert alert-error alert-soft">
                {error}
              </div>
            )}

            <label className="floating-label">
              <span>Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="floating-label">
              <span>Password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="Password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <label className="floating-label">
              <span>Confirm password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="Confirm password"
                className="input w-full"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary mt-2"
              disabled={loading}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              Sign Up
            </button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
