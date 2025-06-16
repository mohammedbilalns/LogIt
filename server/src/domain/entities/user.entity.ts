import { BaseEntity } from "./base.entity";

export interface User extends BaseEntity {
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
  isBlocked?: boolean;
  googleId?: string;
  profileImage?: string;
  profession?: string;
  bio?: string;
  provider?: "local" | "google";
  role: "user" | "admin" | "superadmin";
}

export type UserWithoutPassword = Omit<User, "password">;
