import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores([
		"dist",
		"src/routeTree.gen.ts",
		".claude/**",
		".cursor/**",
		".agents/**",
	]),
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: { "unused-imports": unusedImports },
		extends: [
			reactHooks.configs.flat["recommended-latest"],
			reactRefresh.configs.vite,
		],
		rules: {
			"func-style": ["error", "expression", { allowArrowFunctions: true }],
			"unused-imports/no-unused-imports": "error",
		},
	},
	{
		// O HMR dos arquivos de rota e responsabilidade do plugin do router.
		files: ["src/routes/**/*.{ts,tsx}"],
		rules: {
			"react-refresh/only-export-components": "off",
		},
	},
	{
		files: ["src/components/ui/**/*.{ts,tsx}", "src/lib/utils.ts"],
		rules: {
			"func-style": "off",
			"react-refresh/only-export-components": "off",
		},
	},
]);
