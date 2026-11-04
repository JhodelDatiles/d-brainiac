import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    PORT: z.coerce.number().int().positive().default(5000),
    CLIENT_URL: z.string().default("http://localhost:5173"),

    // Email (shared)
    MAIL_FROM_EMAIL: z.string().default("no-reply@example.com"),
    MAIL_FROM_NAME: z.string().default("Brainiac"),

    // Production: Brevo
    BREVO_API_KEY: z.string().optional(),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),

    // Cloudinary (avatar storage)
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // Development: optional SMTP (e.g. Mailtrap). Leave empty to use Ethereal.
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
  })
  .refine((e) => e.NODE_ENV !== "production" || !!e.BREVO_API_KEY, {
    message: "BREVO_API_KEY is required in production",
    path: ["BREVO_API_KEY"],
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:\n" + z.prettifyError(parsed.error),
  );
  process.exit(1);
}

const env = parsed.data;

export const config = {
  isProduction: env.NODE_ENV === "production",
  mongoUri: env.MONGO_URI,
  port: env.PORT,
  clientUrl: env.CLIENT_URL,
  jwt: {
    secret: env.JWT_SECRET,
    expiresInDays: env.JWT_EXPIRES_IN_DAYS,
  },
  mail: {
    fromEmail: env.MAIL_FROM_EMAIL,
    fromName: env.MAIL_FROM_NAME,
  },
  brevoApiKey: env.BREVO_API_KEY,
  smtp:
    env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
      ? {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : undefined,
  cloudinary:
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
      ? {
          cloudName: env.CLOUDINARY_CLOUD_NAME,
          apiKey: env.CLOUDINARY_API_KEY,
          apiSecret: env.CLOUDINARY_API_SECRET,
        }
      : undefined,
};
