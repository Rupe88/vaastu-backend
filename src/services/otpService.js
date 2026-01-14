import { prisma } from '../config/database.js';
import { OtpType } from '@prisma/client';

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOTP = async (userId, type) => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    const otpRecord = await prisma.otp.create({
      data: {
        userId,
        otp,
        type,
        expiresAt,
      },
    });

    return otp;
  } catch (error) {
    throw new Error('Failed to create OTP');
  }
};

export const verifyOTP = async (userId, otp, type) => {
  try {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId,
        otp,
        type,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return { valid: true, otpRecord };
  } catch (error) {
    throw new Error('Failed to verify OTP');
  }
};

export const canResendOTP = async (userId, type) => {
  try {
    const recentOTP = await prisma.otp.findFirst({
      where: {
        userId,
        type,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!recentOTP) {
      return { canResend: true };
    }

    // Count OTPs in the last hour
    const otpCount = await prisma.otp.count({
      where: {
        userId,
        type,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    });

    if (otpCount >= 3) {
      return { canResend: false, message: 'Maximum OTP requests reached. Please try again later.' };
    }

    return { canResend: true };
  } catch (error) {
    throw new Error('Failed to check OTP resend eligibility');
  }
};

export const cleanupExpiredOTPs = async () => {
  try {
    await prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
};

