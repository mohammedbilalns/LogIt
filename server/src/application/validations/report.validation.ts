import { z } from "zod";

export const createReportSchema = z.object({
  targetType: z.enum(["article", "user"], {
    errorMap: () => ({ message: "Target type must be either 'article' or 'user'" }),
  }),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters long").max(500, "Reason cannot exceed 500 characters"),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["pending", "reviewed", "resolved"], {
    errorMap: () => ({ message: "Status must be one of: pending, reviewed, resolved" }),
  }),
  actionTaken: z.string().min(10, "Action taken must be at least 10 characters long").max(500, "Action taken cannot exceed 500 characters").optional(),
}); 