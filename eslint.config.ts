import { ESLint } from "eslint";

const eslintConfig: ESLint.Options = {
  ignorePatterns: ["node_modules/", "dist/", "build/", "**/*.min.js", "**/coverage/", "**/*.test.js", "public/", "*.log", "scripts/**/*.js"],
};

export default eslintConfig;
