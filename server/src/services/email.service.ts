import axios from "axios";
import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../envConfig.ts";
interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

// ---------- Development: nodemailer ----------
let devTransporter: Transporter | undefined;

const getDevTransporter = async (): Promise<Transporter> => {
  if (devTransporter) return devTransporter;

  if (config.smtp) {
    // Email service file — Gmail SMTP transporter
    const smtpOptions = {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
      family: 4,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    };

    devTransporter = nodemailer.createTransport(smtpOptions);
  } else {
    // No SMTP configured: use a throwaway Ethereal inbox
    const account = await nodemailer.createTestAccount();
    devTransporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    });
  }

  return devTransporter;
};

const sendWithNodemailer = async ({
  to,
  subject,
  html,
}: MailOptions): Promise<void> => {
  const transporter = await getDevTransporter();
  const info = await transporter.sendMail({
    from: `"${config.mail.fromName}" <${config.mail.fromEmail}>`,
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log(`Email preview: ${previewUrl}`);
};

// ---------- Production: Brevo via axios ----------
const sendWithBrevo = async ({
  to,
  subject,
  html,
}: MailOptions): Promise<void> => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: config.mail.fromName, email: config.mail.fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": config.brevoApiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        timeout: 10_000,
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Brevo request failed: ${JSON.stringify(error.response?.data ?? error.message)}`,
      );
    }
    throw error;
  }
};

export const sendEmail = (options: MailOptions): Promise<void> =>
  config.isProduction ? sendWithBrevo(options) : sendWithNodemailer(options);

// ---------- Templates ----------
export const verificationEmail = (
  link: string,
): { subject: string; html: string } => ({
  subject: "Confirm your email",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Confirm your email</h2>
      <p>Thanks for signing up! Click the button below to confirm your email address.</p>
      <p>
        <a href="${link}"
           style="display:inline-block;padding:12px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">
          Confirm email
        </a>
      </p>
      <p style="font-size:13px;color:#666;">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
    </div>
  `,
});
