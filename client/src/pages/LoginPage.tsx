import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/UseAuth";
import { getErrorMessage } from "../lib/api";

export default function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Page the user originally tried to visit (set by ProtectedRoute)
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/library";

  if (isLoading) return null;
  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not log in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <PublicNavbar />
      <div className="flex justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="card card-border w-full max-w-md bg-base-100"
        >
          <div className="card-body gap-3">
            <h1 className="card-title text-2xl">Welcome back</h1>
            <p className="text-sm opacity-70">Log in to open your library.</p>

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
                autoComplete="current-password"
                placeholder="Password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Login
            </button>

            <p className="text-center text-sm">
              No account yet?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
