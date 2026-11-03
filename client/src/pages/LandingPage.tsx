import { Link } from "react-router";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/UseAuth";

// Placeholder copy: replace with the real features of Brainiac.
const features = [
  {
    icon: "📚",
    title: "Your personal library",
    text: "Keep everything you want to learn and revisit in one organized place.",
  },
  {
    icon: "🔎",
    title: "Find things fast",
    text: "Search your library instantly instead of digging through folders and notes.",
  },
  {
    icon: "🌗",
    title: "Light & dark mode",
    text: "Pick the theme that is easiest on your eyes, day or night.",
  },
  {
    icon: "🔒",
    title: "Private by default",
    text: "Your account and your content stay yours, with full control over deleting them.",
  },
];

const steps = [
  { title: "Create an account", text: "Sign up in under a minute." },
  {
    title: "Build your library",
    text: "Add and organize the content you care about.",
  },
  {
    title: "Come back anytime",
    text: "Log in from anywhere and pick up where you left off.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-base-100">
      <PublicNavbar />

      {/* Hero */}
      <section className="hero bg-base-200 py-16 md:py-28">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold md:text-6xl">
              Think bigger with Brainiac
            </h1>
            <p className="py-6 text-lg opacity-80">
              A simple, focused space to collect, organize and revisit
              everything you want to learn.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {user ? (
                <Link to="/library" className="btn btn-primary btn-lg">
                  Go to Library
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Get started free
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-5xl scroll-mt-16 px-4 py-16"
      >
        <h2 className="mb-10 text-center text-3xl font-bold">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card card-border bg-base-100">
              <div className="card-body">
                <h3 className="card-title">
                  <span className="text-2xl">{f.icon}</span> {f.title}
                </h3>
                <p className="opacity-80">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-16 bg-base-200 px-4 py-16"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold">How it works</h2>
          <ul className="steps steps-vertical w-full">
            {steps.map((s) => (
              <li key={s.title} className="step step-primary">
                <div className="text-left">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm opacity-70">{s.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-6 text-sm opacity-70">
        <p>© {new Date().getFullYear()} Brainiac. All rights reserved.</p>
      </footer>
    </div>
  );
}
