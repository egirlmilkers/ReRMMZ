import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import unicorn from "eslint-plugin-unicorn";
import esx from "eslint-plugin-es-x";

export default defineConfig([
	// 1. Base rules
	js.configs.recommended,

	// 2. Enforce ES2025 syntax (errors on old syntax)
	esx.configs["recommended-style-2025"],

	// 3. This is the OVERKILL.
	// Runs all strict, type-checking-required rules.
	// This will lint based on your tsconfig.json.
	...ts.configs["strict-type-checked"],

	// 4. Aggressive modernization (optional chaining, etc.)
	unicorn.configs["flat/recommended"],

	// 5. Your main project configuration
	{
		name: "rermmz/typescript-main",
		files: ["src/**/*.ts"], // <-- IMPORTANT: Only lints .ts files
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",

			// Tell ESLint to use the TS parser
			parser: tsParser,
			parserOptions: {
				// Tell the parser where your tsconfig is for type-aware rules
				project: true,
				tsconfigRootDir: ".",
			},
			globals: {
				// Add your known globals (Pixi, etc.)
				// Note: effekseer is here as a global from its .d.ts
				"effekseer": "readonly",
				"window": "readonly",
				"document": "readonly"
			},
		},
		plugins: {
			// Define the plugins
			"@typescript-eslint": ts,
			"unicorn": unicorn,
			"es-x": esx,
		},
	},

	// 6. Global ignores
	{
		ignores: ["dist/", "lib/", "node_modules/", "eslint.config.js"],
	},
]);