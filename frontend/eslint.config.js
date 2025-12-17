import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "react-hooks/exhaustive-deps": "off", // Checks effect dependencies
      "react-refresh/only-export-components": "off", // Warns if components are not exported
      "@typescript-eslint/no-explicit-any": "off", // Disables the rule that disallows 'any' type
      "@typescript-eslint/no-unused-vars": "off", // Warns about unused variables, ignoring those starting with '_'
      "no-unused-vars": "off", // Also try turning off the base rule
    },
  },
]);
