import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // react-hooks: exhaustive-deps 降为 warn，项目中存在合理的 ref-in-render 模式
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "warn",
      // typescript-eslint
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      // 基础规则
      "no-useless-escape": "warn",
      "prefer-const": "warn",
      "no-useless-assignment": "warn",
      "no-control-regex": "warn",
      "no-empty": "warn",
    },
  },
  {
    ignores: [
      "dist/",
      "node_modules/",
      "public/",
      "html-anything/",
      "r-markdown/",
      ".agent/",
      ".qoder/",
      "docs/",
    ],
  },
  prettierConfig,
);
