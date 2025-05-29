import { config } from "dotenv";
import nodemailer from "nodemailer";

config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Set to true only if using port 465
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// OTP generator
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Core email sender
async function sendEmail(to, subject, html, text) {
  try {
    const info = await transporter.sendMail({
      from: `"topCollec" <${process.env.SMTP_USERNAME}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Email service failure');
  }
}

// 📩 Send OTP during registration (returns OTP for DB)
export async function sendRegistrationOtp(userEmail) {
  const otp = generateOTP();

  const subject = 'Verify Your Email - topCollec Registration';
  const text = `Welcome to topCollec! Use the following OTP to verify your email: ${otp}`;
  const html = `
    <p>Dear User,</p>
    <p>Welcome to <strong>topCollec</strong>! Please verify your email address to complete your registration:</p>
    <p><b style="font-size: 20px;">${otp}</b></p>
    <p>This OTP is valid for the next 10 minutes. Do not share it with anyone.</p>
    <p>Thanks for joining us!<br />— The topCollec Team</p>`;

  await sendEmail(userEmail, subject, html, text);
  return otp;
}
