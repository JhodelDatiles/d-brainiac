import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import PublicNavbar from "../components/PublicNavbar";
import { api, getErrorMessage } from "../lib/api";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This confirmation link is missing its token.",
  );
  // The token is single-use, and StrictMode runs effects twice in dev
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    api
      .post<{ message: string }>("/auth/verify-email", { token })
      .then((res) => {
        setMessage(res.data.message);
        setStatus("success");
      })
      .catch((err) => {
        setMessage(
          getErrorMessage(
            err,
            "Could not confirm your email. Please try again.",
          ),
        );
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-base-200">
      <PublicNavbar />
      <div className="flex justify-center px-4 py-12">
        <div className="card card-border w-full max-w-md bg-base-100">
          <div className="card-body items-center gap-3 text-center">
            {status === "loading" && (
              <>
                <span className="loading loading-spinner loading-lg" />
                <p>Confirming your email…</p>
              </>
            )}
            {status === "success" && (
              <>
                <h1 className="card-title text-2xl">Email confirmed 🎉</h1>
                <p className="text-sm opacity-70">{message}</p>
                <Link to="/login" className="btn btn-primary mt-2">
                  Go to login
                </Link>
              </>
            )}
            {status === "error" && (
              <>
                <h1 className="card-title text-2xl">Couldn't confirm</h1>
                <div role="alert" className="alert alert-error alert-soft">
                  {message}
                </div>
                <Link to="/signup" className="btn btn-outline mt-2">
                  Sign up again
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
