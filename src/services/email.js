import nodemailer from "nodemailer";
import { config } from "../config/config.js";
import { AppError } from "../utils/errorHandler.js";
import { createEmailVerification } from "../repositories/authRepositories.js";

const transporter = nodemailer.createTransport({
  host: config.gmailHost,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: { user: config.gmailUser, pass: config.gmailPass },
});

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
    await transporter.sendMail({ from: config.fromEmail, to, subject, html });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Email service error for ${to}:`, error);
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
