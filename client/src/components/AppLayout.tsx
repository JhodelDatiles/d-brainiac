import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "../context/UseAuth";
import { LibraryIcon, MenuIcon, SettingsIcon, UserIcon } from "./Icons";

const links = [
  { to: "/library", label: "Library", icon: <LibraryIcon /> },
  { to: "/profile", label: "Profile", icon: <UserIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

/** Layout for authenticated pages: top bar with a hamburger that opens a side drawer. */
export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="drawer">
      <input
        id="app-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
      />

      <div className="drawer-content flex min-h-screen flex-col">
        <header className="navbar sticky top-0 z-10 border-b border-base-300 bg-base-100/90 px-4 backdrop-blur">
          <div className="navbar-start">
            <label
              htmlFor="app-drawer"
              className="btn btn-square btn-ghost"
              aria-label="Open menu"
            >
              <MenuIcon />
            </label>
          </div>
          <div className="navbar-center">
            <Link to="/library" className="text-xl font-bold tracking-tight">
              🧠 Brainiac
            </Link>
          </div>
          <div className="navbar-end">
            <Link
              to="/profile"
              className="avatar avatar-placeholder"
              aria-label="Profile"
            >
              <div className="w-9 rounded-full bg-primary text-primary-content">
                <span className="text-sm uppercase">
                  {user?.name.charAt(0) ?? "?"}
                </span>
              </div>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      <div className="drawer-side z-20">
        <label
          htmlFor="app-drawer"
          aria-label="Close menu"
          className="drawer-overlay"
        />
        <aside className="flex min-h-full w-72 flex-col bg-base-200 p-4">
          <div className="mb-4 px-2">
            <p className="font-semibold">{user?.name}</p>
            <p className="truncate text-sm opacity-70">{user?.email}</p>
          </div>
          <ul className="menu w-full gap-1 p-0">
            {links.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => (isActive ? "menu-active" : "")}
                >
                  {icon}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
