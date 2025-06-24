import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/logit"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  EMAIL_USER: z.string().email("Invalid email for EMAIL_USER"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is requried"),
  REDIS_PORT: z
    .string()
    .min(1, "REDIS_PORT is required")
    .transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().min(1, "REDIS_PASSWORD is requried"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const env = envSchema.parse(process.env);
export default env;
