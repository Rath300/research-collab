// eslint-disable-next-line
/** @type {import("eslint").Linter.Config} */
export const config = {
  extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
  rules: {
    "react/react-in-jsx-scope": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

export default config;
