import axios, { isAxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
  timeout: 15_000,
});

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[] | undefined>;
}

/** Turns any axios error into a message that's safe to show the user. */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!isAxiosError<ApiErrorBody>(error)) return fallback;

  if (!error.response) {
    return "Can't reach the server. Check your connection and try again.";
  }

  const fieldErrors = error.response.data?.errors;
  if (fieldErrors) {
    const first = Object.values(fieldErrors).flat().find(Boolean);
    if (first) return first;
  }

  return error.response.data?.message ?? fallback;
}
