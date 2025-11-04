import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import esx from "eslint-plugin-es-x";

export default defineConfig([
	// 1. Base ESLint recommended rules (catches common bugs)
	js.configs.recommended,

	// enforces ES6 (2015) syntax only
	// will error on ES5 syntax AND any syntax newer than ES6
	esx.configs["recommended-style-2015"],

	{
		name: "rermmz/js-es6",
		files: ["src/**/*.js"],
		languageOptions: {
			// Explicitly set the parser to ES6 (2015)
			ecmaVersion: 2015,
			sourceType: "module",

			globals: {
				// Globals
				window: "readonly",
				document: "readonly",
				effekseer: "readonly",
			},
		},
		rules: {
			// key ES6 upgrades
			"no-var": "error", // Fail on 'var'
			"prefer-const": "error", // Require 'const' or 'let'
			"object-shorthand": "warn", // { a: a } should be { a }
			"prefer-arrow-callback": "error", // Use () => {} for callbacks
			"prefer-template": "error", // Use string templates over '+'
		},
	},

	{
		ignores: ["dist/", "local_modules/", "node_modules/"],
	},
]);
