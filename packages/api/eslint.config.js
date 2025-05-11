import { config as baseConfig } from "@research-collab/eslint-config/base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  // Add any api-specific overrides or additions here
  {
    files: ["**/*.ts", "**/*.tsx"], // Ensure this applies to TypeScript files
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json", // Assuming a tsconfig.json exists in packages/api
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]; 