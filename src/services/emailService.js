import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { config } from '../config/env.js';

let transporter = null;
let resendClient = null;

// Initialize Nodemailer transporter
const initNodemailer = () => {
  if (!transporter) {
    if (!config.smtpUser || !config.smtpPass) {
      throw new Error('SMTP configuration is missing');
    }

    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }
  return transporter;
};

// Initialize Resend client
const initResend = () => {
  if (!resendClient && config.resendApiKey) {
    resendClient = new Resend(config.resendApiKey);
  }
  return resendClient;
};

// Email templates
const getOTPEmailTemplate = (otp, purpose = 'verification') => {
  const purposeText = purpose === 'password_reset' ? 'reset your password' : 'verify your email';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">${config.appName}</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333; margin-top: 0;">OTP Verification</h2>
        <p>Hello,</p>
        <p>You have requested to ${purposeText}. Please use the following OTP to complete the process:</p>
        <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #667eea; font-size: 36px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This OTP will expire in 5 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} ${config.appName}. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

const getWelcomeEmailTemplate = (fullName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">${config.appName}</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333; margin-top: 0;">Welcome, ${fullName}!</h2>
        <p>Thank you for joining ${config.appName}. Your email has been successfully verified.</p>
        <p>You can now access all features of our platform.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/login" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} ${config.appName}. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Send email using Nodemailer
const sendWithNodemailer = async (to, subject, html) => {
  try {
    const transporter = initNodemailer();
    const mailOptions = {
      from: `"${config.appName}" <${config.smtpFrom || config.smtpUser}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId, method: 'nodemailer' };
  } catch (error) {
    throw new Error(`Nodemailer error: ${error.message}`);
  }
};

// Send email using Resend (fallback)
const sendWithResend = async (to, subject, html) => {
  try {
    const resend = initResend();
    if (!resend) {
      throw new Error('Resend API key not configured');
    }

    const fromEmail =
      config.resendFromEmail || config.smtpFrom || `noreply@sanskaracademy.com`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return { success: true, messageId: data.id, method: 'resend' };
  } catch (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
};

// Main send email function with fallback
export const sendEmail = async (to, subject, html, retries = 2) => {
  let lastError = null;

  // Try Nodemailer first
  try {
    return await sendWithNodemailer(to, subject, html);
  } catch (error) {
    lastError = error;
    console.warn('Nodemailer failed, trying Resend...', error.message);
  }

  // Fallback to Resend
  try {
    return await sendWithResend(to, subject, html);
  } catch (error) {
    lastError = error;
    console.error('Both email services failed:', error.message);
  }

  throw new Error(`Failed to send email: ${lastError?.message || 'Unknown error'}`);
};

// Specific email functions
export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const subject = purpose === 'password_reset' 
    ? 'Password Reset OTP' 
    : 'Email Verification OTP';
  const html = getOTPEmailTemplate(otp, purpose);
  return await sendEmail(email, subject, html);
};

export const sendWelcomeEmail = async (email, fullName) => {
  const subject = `Welcome to ${config.appName}!`;
  const html = getWelcomeEmailTemplate(fullName);
  return await sendEmail(email, subject, html);
};

