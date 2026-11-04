import { createContext } from "react";

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["value"];

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  gender: Gender;
  avatarUrl: string | null;
}

export type ProfileInput = Pick<User, "name" | "bio" | "gender">;

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileInput) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
