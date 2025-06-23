import { z } from "zod";

export const followUserSchema = z.object({
  targetUserId: z.string({ required_error: "targetUserId is required" })
    .min(1, "targetUserId is required")
});

export const unfollowUserSchema = z.object({
  targetUserId: z.string({ required_error: "targetUserId is required" })
    .min(1, "targetUserId is required")
});

export const blockUserSchema = z.object({
  targetUserId: z.string({ required_error: "targetUserId is required" })
    .min(1, "targetUserId is required")
});

export const unblockUserSchema = z.object({
  targetUserId: z.string({ required_error: "targetUserId is required" })
    .min(1, "targetUserId is required")
}); 