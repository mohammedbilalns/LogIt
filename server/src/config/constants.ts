export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const ACCESS_TOKEN_EXPIRY = "45m"; // Changed from '1m' to '15m'
export const REFRESH_TOKEN_EXPIRY = "7d";
export const ACCESS_COOKIE_EXPIRY = 45 * 60 * 1000; // 45 minutes in milliseconds
export const REFRESH_COOKIE_EXPIRY = 7 * 24 * 60 * 60 * 1000;
export const OTP_EXPIRY = 300;
export const OTP_LENGTH = 6;
