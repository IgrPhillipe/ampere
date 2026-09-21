import { resolve } from "node:path";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, __dirname, "");

	return {
		plugins: [
			tanstackRouter({ target: "react", autoCodeSplitting: true }),
			react(),
			babel({ presets: [reactCompilerPreset()] }),
			tailwindcss(),
		],
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
		server: {
			proxy: {
				// In production the deploy is what resolves /api.
				"/api": {
					target: env.VITE_PROXY_TARGET || "http://localhost:8080",
					changeOrigin: true,
				},
			},
		},
	};
});
