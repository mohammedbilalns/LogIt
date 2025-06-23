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

export interface UserInfoWithRelationship {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  profession?: string;
  bio?: string;
  isBlocked?: boolean;
  isFollowed: boolean;
  isFollowingBack: boolean;
  isBlockedByYou: boolean;
}
