import { z } from "zod";

export const createChatSchema = z.object({
  isGroup: z.boolean(),
  name: z.string().optional(),
  participants: z.array(z.string()).min(1),
});

export const addParticipantSchema = z.object({
  userId: z.string(),
});

export const sendMessageSchema = z.object({
  content: z.string().optional(),
  media: z.string().optional(),
  log: z.string().optional(),
  replyTo: z.string().optional(),
}); 