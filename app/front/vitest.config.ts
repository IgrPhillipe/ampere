import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
			"@styles": resolve(__dirname, "src/styles"),
			"@services": resolve(__dirname, "src/services"),
			"@config": resolve(__dirname, "src/config"),
			"@lib": resolve(__dirname, "src/lib"),
			"@hooks": resolve(__dirname, "src/hooks"),
			"@components": resolve(__dirname, "src/components"),
			"@features": resolve(__dirname, "src/features"),
			"@routes": resolve(__dirname, "src/routes"),
			"@assets": resolve(__dirname, "src/assets"),
			"@providers": resolve(__dirname, "src/providers"),
		},
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		clearMocks: true,
	},
});
