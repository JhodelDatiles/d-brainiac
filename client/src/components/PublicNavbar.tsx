import { Link } from "react-router";
import { useAuth } from "../context/UseAuth";

export default function PublicNavbar() {
  const { user } = useAuth();

  return (
    <header className="navbar sticky top-0 z-10 border-b border-base-300 bg-base-100/90 px-4 backdrop-blur">
      <div className="navbar-start">
        <Link to="/" className="text-xl font-bold tracking-tight">
          🧠 Brainiac
        </Link>
      </div>

      <nav className="navbar-center hidden gap-1 md:flex">
        <a href="/#features" className="btn btn-ghost btn-sm">
          Features
        </a>
        <a href="/#how-it-works" className="btn btn-ghost btn-sm">
          How it works
        </a>
      </nav>

      <div className="navbar-end gap-2">
        {user ? (
          <Link to="/library" className="btn btn-primary btn-sm">
            Go to Library
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
