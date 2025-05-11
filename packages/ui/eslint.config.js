import { config as baseConfig } from "@research-collab/eslint-config/base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  // Add any ui-specific overrides or additions here
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // Add specific settings for React if not covered by baseConfig or if overrides needed
    // settings: {
    //   react: {
    //     version: "detect",
    //   },
    // },
    // rules: {
    //   "react/react-in-jsx-scope": "off", // Example if needed
    // }
  },
]; 