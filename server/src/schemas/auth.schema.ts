import { z } from "zod";
import { GENDERS } from "../constants/gender.ts";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

// bcrypt only uses the first 72 BYTES, so check bytes, not characters
const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .refine(
    (v) => Buffer.byteLength(v, "utf8") <= 72,
    "Password must be at most 72 bytes",
  );

export const signupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required").max(200),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required").max(128),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(128),
    newPassword: passwordField,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required").max(128),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export const resendVerificationSchema = z.object({ email: emailField });
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name is too long"),
  bio: z.string().trim().max(300, "Bio must be at most 300 characters"),
  gender: z.enum(GENDERS, "Select a valid option"),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
