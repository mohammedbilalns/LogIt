import {User} from "./../entities/user"

export interface AuthService {
    login: (email: string, password: string) => Promise<User>;
    signup: (name: string, email: string, password: string) => Promise<User>;
    verifyEmail: (email: string, otp: string) => Promise<User>;
    logout: () => void;
    checkAuth: () => Promise<User | null>;
    resendOTP: (email: string) => Promise<{ message: string }>;
    googleAuth: (credential: string) => Promise<User>;
    initiatePasswordReset: (email: string) => Promise<{ email: string; message: string }>;
    verifyResetOTP: (email: string, otp: string) => Promise<{ email: string; message: string }>;
    updatePassword: (email: string, otp: string, newPassword: string) => Promise<User>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<User>;
}