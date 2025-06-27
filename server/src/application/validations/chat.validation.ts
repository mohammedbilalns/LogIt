import { z } from "zod";

export const createChatSchema = z.object({
  isGroup: z.boolean(),
  name: z.string().optional(),
  participants: z.array(z.string()).min(1),
});

export const createGroupChatSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  participants: z.array(z.string()).min(1, "At least one participant is required"),
});

export const addParticipantSchema = z.object({
  participants: z.array(z.string()).min(1, 'At least one participant is required'),
});

export const sendMessageSchema = z.object({
  content: z.string().optional(),
  media: z.string().optional(),
  log: z.string().optional(),
  replyTo: z.string().optional(),
}); 