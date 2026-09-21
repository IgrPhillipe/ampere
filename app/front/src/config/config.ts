import { textFieldSchema } from "@features/shared";
import { z } from "zod";

const envSchema = z.object({
	VITE_API_URL: textFieldSchema.optional().default("/api"),
});

const env = envSchema.parse(import.meta.env);

export type Env = z.infer<typeof envSchema>;

export const AppConfig = {
	API_URL: env.VITE_API_URL,
	IS_DEV: import.meta.env.DEV,
};
