import { textFieldSchema } from "@features/shared";
import { z } from "zod";

const envSchema = z.object({
	VITE_API_URL: textFieldSchema.optional().default("/api"),
	/** Comes as a string from `import.meta.env`: env vars have no type. */
	VITE_ENABLE_MSW: z
		.enum(["true", "false"])
		.optional()
		.default("false")
		.transform((value) => value === "true"),
});

const env = envSchema.parse(import.meta.env);

export type Env = z.infer<typeof envSchema>;

export const AppConfig = {
	API_URL: env.VITE_API_URL,
	ENABLE_MSW: env.VITE_ENABLE_MSW,
	IS_DEV: import.meta.env.DEV,
};
