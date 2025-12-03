import sgMail from "@sendgrid/mail";
import { config } from "../config/config.js";
import { AppError } from "../utils/errorHandler.js";
import { createEmailVerification } from "../repositories/authRepositories.js";

// Initialize SendGrid with API key
sgMail.setApiKey(config.sendgridApiKey);

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// A more structured HTML template for emails
const emailHTMLTemplate = (title, message, code) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="text-align: center; color: #333;">${title}</h2>
    <p>${message}</p>
    <div style="font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 30px 0; padding: 15px; background-color: #f2f2f2; border-radius: 4px;">${code}</div>
    <p style="font-size: 12px; color: #888; text-align: center;">This code will expire in 15 minutes.</p>
  </div>`;

const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: config.sendgridFromEmail,
      subject,
      html,
    };
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Email service error for ${to}:`, error);

    // Log detailed SendGrid error
    if (error.response) {
      console.error("SendGrid Error Code:", error.code);
      console.error(
        "SendGrid Error Body:",
        JSON.stringify(error.response.body, null, 2)
      );
    }

    // Provide more specific error messages
    if (error.code === 401) {
      console.error("❌ SendGrid API Key is INVALID or EXPIRED");
      console.error(
        "Solution: Generate a new API key at https://app.sendgrid.com/settings/api_keys"
      );
    } else if (error.code === 403) {
      console.error("❌ Sender email is NOT VERIFIED in SendGrid");
      console.error(
        "Solution: Verify your sender at https://app.sendgrid.com/settings/sender_auth"
      );
    }

    throw new AppError("EMAIL_SERVICE_ERROR");
  }
};

export const sendVerificationEmail = async (email, name) => {
  const code = generateVerificationCode();
  await createEmailVerification(email, code, "registration");
  const html = emailHTMLTemplate(
    "Verify Your Email Address",
    `Hi ${name}, please use the code below to complete your registration.`,
    code
  );
  await sendEmail(email, "Your Verification Code", html);
};

export const sendPasswordResetEmail = async (email, name) => {
  const code = generateVerificationCode();
  await createEmailVerification(email, code, "password_reset");
  const html = emailHTMLTemplate(
    "Password Reset Request",
    `Hi ${name}, you requested to reset your password. Use this code to proceed. If you did not request this, please ignore this email.`,
    code
  );
  await sendEmail(email, "Your Password Reset Code", html);
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="text-align: center; color: #333;">Welcome to the Platform, ${name}! 🎉</h2>
      <p>Your account is now verified and ready to go. We're excited to have you on board.</p>
    </div>`;
  await sendEmail(email, "Welcome to Our Platform!", html);
};
