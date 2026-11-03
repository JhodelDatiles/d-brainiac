const base = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.8,
  stroke: "currentColor",
  className: "h-5 w-5",
} as const;

export function MenuIcon() {
  return (
    <svg {...base}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

export function LibraryIcon() {
  return (
    <svg {...base}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19.5V5a1 1 0 0 1 1-1h3v16H5a1 1 0 0 1-1-.5ZM8 4h4v16H8M12 6l4.5-1.5 3 14-4.5 1.5-3-14Z"
      />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg {...base}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.1a7.5 7.5 0 0 1 15 0"
      />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg {...base}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.3 4.3a1.7 1.7 0 0 1 3.4 0 1.7 1.7 0 0 0 2.5 1.4 1.7 1.7 0 0 1 1.7 2.9 1.7 1.7 0 0 0 0 2.8 1.7 1.7 0 0 1-1.7 2.9 1.7 1.7 0 0 0-2.5 1.4 1.7 1.7 0 0 1-3.4 0 1.7 1.7 0 0 0-2.5-1.4 1.7 1.7 0 0 1-1.7-2.9 1.7 1.7 0 0 0 0-2.8 1.7 1.7 0 0 1 1.7-2.9 1.7 1.7 0 0 0 2.5-1.4ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}
