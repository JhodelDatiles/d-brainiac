import { useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { AuthContext, type AuthContextValue, type User } from "./AuthContext";

interface ApiUser {
  id: string;
  email: string;
}

// The server only stores email for now; name/bio are placeholders until
// profile endpoints exist.
const toUser = (u: ApiUser): User => ({
  id: u.id,
  email: u.email,
  name: u.email.split("@")[0],
  bio: "",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from the cookie on page load
  useEffect(() => {
    const controller = new AbortController();

    api
      .get<{ user: ApiUser }>("/auth/me", { signal: controller.signal })
      .then((res) => setUser(toUser(res.data.user)))
      .catch(() => {
        /* not logged in */
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const { data } = await api.post<{ user: ApiUser }>("/auth/login", {
          email,
          password,
        });
        setUser(toUser(data.user));
      },
      // Signup does NOT log the user in: they must confirm their email first
      signup: async (email, password, confirmPassword) => {
        await api.post("/auth/signup", { email, password, confirmPassword });
      },
      logout: async () => {
        setUser(null);
        try {
          await api.post("/auth/logout");
        } catch {
          /* cookie expires on its own */
        }
      },
      // TODO: PATCH /api/users/me (name/bio aren't stored on the server yet)
      updateProfile: async (data) => {
        setUser((prev) => (prev ? { ...prev, ...data } : prev));
      },
      changePassword: async (current, next) => {
        await api.patch("/users/me/password", {
          currentPassword: current,
          newPassword: next,
        });
      },
      deleteAccount: async (password) => {
        await api.delete("/users/me", { data: { password } });
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
