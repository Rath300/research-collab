import { config as baseConfig } from "@research-collab/eslint-config/base.js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  // Add any db-specific overrides or additions here
  // For example, if parserOptions for this specific project were still needed:
  {
    files: ["**/*.ts", "**/*.tsx"], // Ensure this applies to TypeScript files
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname, // or __dirname if using CJS context
      },
    },
  },
  {
    // If there are specific rules for the db package
    // rules: {
    //   "some-db-specific-rule": "warn",
    // }
  }
]; 