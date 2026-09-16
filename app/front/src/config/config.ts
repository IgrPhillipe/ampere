import { z } from "zod";

import { textFieldSchema } from "@/features/shared";

const envSchema = z.object({
	VITE_API_URL: textFieldSchema,
});

const env = envSchema.parse(import.meta.env);

export type Env = z.infer<typeof envSchema>;

export const AppConfig = {
	API_URL: env.VITE_API_URL || "/api",
};
