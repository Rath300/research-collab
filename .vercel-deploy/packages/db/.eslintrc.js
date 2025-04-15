module.exports = {
  root: true,
  extends: ["@research-collab/eslint-config/base"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
};
